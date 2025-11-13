import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApiHttpService } from './api-http.service';
import { RuntimeConfigService } from '../config/runtime-config.service';

/**
 * Types for the upload flow and result tracking.
 */
export interface UploadProgressEvent {
  /** 0-100 progress percentage for upload stage */
  progress: number;
  /** Optional message for UI display */
  message?: string;
  /** When the backend accepts the upload and returns a job id */
  jobId?: string;
  /** True if finished (result ready); resultId may be populated */
  done?: boolean;
  /** When done and result is associated */
  resultId?: string;
  /** If error occurs */
  error?: string;
}

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private readonly api: ApiHttpService,
    private readonly runtime: RuntimeConfigService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  /**
   * PUBLIC_INTERFACE
   * Upload an image file as multipart/form-data to `${apiBase}/uploads/image`.
   * - Reports upload progress (0-100).
   * - Emits a jobId upon backend acceptance.
   * - If NG_APP_WS_URL is set and in the browser, attempts to open a WebSocket to receive completion.
   * - Otherwise falls back to polling `${apiBase}/results/:jobId` until ready.
   * - Emits a final event with done=true and resultId, then completes.
   */
  uploadImage(file: any): Observable<UploadProgressEvent> {
    const out$ = new Subject<UploadProgressEvent>();

    // Ensure we are in the browser for File/FormData usage
    if (!this.isBrowser()) {
      // On server we cannot perform file uploads; emit error and complete.
      const g: any = globalThis as any;
      const st = typeof g?.setTimeout === 'function' ? g.setTimeout.bind(g) : (fn: Function) => { try { fn(); } catch {} };
      st(() => {
        out$.next({ progress: 0, message: 'Uploads are only supported in the browser.', error: 'Not in browser' });
        out$.complete();
      }, 0);
      return out$.asObservable();
    }

    // Create form data payload (browser-only)
    const g: any = globalThis as any;
    const FormDataCtor = g?.FormData;
    if (!FormDataCtor) {
      const g2: any = globalThis as any;
      const st2 = typeof g2?.setTimeout === 'function' ? g2.setTimeout.bind(g2) : (fn: Function) => { try { fn(); } catch {} };
      st2(() => {
        out$.next({ progress: 0, message: 'FormData not available in this environment.', error: 'FormData unavailable' });
        out$.complete();
      }, 0);
      return out$.asObservable();
    }
    const formData = new FormDataCtor();
    try {
      formData.append('image', file, file?.name || 'upload.jpg');
    } catch {
      // Fallback append without filename
      try { formData.append('image', file); } catch { /* ignore */ }
    }

    // Note: Using HttpClient via ApiHttpService; to track progress we need observe: events and reportProgress=true.
    // ApiHttpService's post<T> returns observe: 'body'. We'll call HttpClient directly via a helper endpoint.
    // Workaround: add an explicit method here for multipart with events.
    const upload$ = this.uploadWithProgress('/uploads/image', formData);

    const sub = upload$
      .pipe(
        tap((event) => {
          if (event.type === HttpEventType.Sent) {
            out$.next({ progress: 0, message: 'Starting upload…' });
          }
          if (event.type === HttpEventType.UploadProgress) {
            const percent = event.total ? Math.round((100 * event.loaded) / event.total) : Math.min(99, Math.round(event.loaded / 1000));
            out$.next({ progress: percent, message: 'Uploading…' });
          }
        }),
        filter((e) => e.type === HttpEventType.Response),
        map((e) => e as any),
        map((resp) => resp.body as { jobId?: string; id?: string; resultId?: string }),
        tap((body) => {
          if (!body) throw new Error('Empty response from upload');
        }),
        switchMap((body) => {
          // Backend might return { jobId } or { id } or { resultId } depending on implementation
          const jobId = body.jobId || body.id || body.resultId;
          if (!jobId) {
            throw new Error('No job id returned from server.');
          }
          out$.next({ progress: 100, message: 'Upload complete. Waiting for results…', jobId });

          // Try WebSocket if available and in browser; otherwise poll
          const wsUrl = this.runtime.get('NG_APP_WS_URL');
          if (wsUrl && this.isBrowser()) {
            return this.trackWithWebSocket(wsUrl, jobId).pipe(
              first(),
              map((resultId) => ({ jobId, resultId })),
              catchError(() => this.pollForResult(jobId).pipe(first(), map((resultId) => ({ jobId, resultId })))),
            );
          }
          return this.pollForResult(jobId).pipe(first(), map((resultId) => ({ jobId, resultId })));
        }),
        catchError((err) => {
          const msg = this.normalizeError(err);
          out$.next({ progress: 0, message: 'Upload failed', error: msg });
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res && res.resultId) {
          out$.next({ progress: 100, message: 'Results ready', jobId: res.jobId, resultId: res.resultId, done: true });
          out$.complete();
        } else if (res === null) {
          out$.complete();
        }
      });

    // Ensure unsubscription on consumer unsubscribe
    return new Observable<UploadProgressEvent>((subscriber) => {
      const s = out$.subscribe(subscriber);
      return () => {
        s.unsubscribe();
        sub.unsubscribe();
      };
    });
  }

  /**
   * INTERNAL: Perform a POST multipart/form-data and observe upload progress events.
   * We bypass ApiHttpService for this specific call to enable observe: 'events'.
   */
  private uploadWithProgress(path: string, formData: any): Observable<HttpEvent<any>> {
    // Access HttpClient through an ephemeral import to avoid circular deps
    const base = (this.api as any)['runtimeConfig'].get('NG_APP_API_BASE') || '';
    const apiBase = String(base).replace(/\/+$/, '');
    const url = /^https?:\/\//i.test(path) ? path : `${apiBase}/${path.replace(/^\/+/, '')}`;

    // Use global injector-less fetch when HttpClient not accessible? No, we do have HttpClient in ApiHttpService.
    // Safely access private http via bracket to avoid TS private modifier errors at compile-time.
    const http = (this.api as any)['http'] as import('@angular/common/http').HttpClient;

    const headers = new HttpHeaders({
      // Let browser set Content-Type boundary for multipart; don't set Content-Type here
    } as any);

    return http.post(url, formData, {
      headers,
      reportProgress: true,
      observe: 'events',
      responseType: 'json',
      withCredentials: false,
    });
  }

  /**
   * INTERNAL: When running in the browser, connects to a WebSocket server to receive job completion.
   * Expects the server to send a JSON message including { jobId, resultId } when done.
   */
  private trackWithWebSocket(wsBaseUrl: string, jobId: string): Observable<string> {
    if (!this.isBrowser()) {
      return of('');
    }
    const subject = new Subject<string>();
    let ws: any = null;

    try {
      const g: any = globalThis as any;
      const WS = g?.WebSocket;
      if (!WS) {
        throw new Error('WebSocket unavailable');
      }
      // Build URL: ensure trailing slash removal and append path if needed.
      const trimmed = wsBaseUrl.replace(/\/+$/, '');
      const url = `${trimmed}/results/${encodeURIComponent(jobId)}`;
      ws = new WS(url);

      ws.onopen = () => {
        // no-op
      };
      ws.onmessage = (ev: any) => {
        try {
          const payload = ev?.data;
          const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
          const rid = (data && (data.resultId || data.id || data.jobId)) as string | undefined;
          if (rid) {
            subject.next(rid);
            subject.complete();
            try { ws?.close(); } catch { /* ignore */ }
          }
        } catch {
          // ignore malformed message
        }
      };
      ws.onerror = () => {
        subject.error(new Error('WebSocket error'));
      };
      ws.onclose = () => {
        if (!subject.closed) {
          subject.error(new Error('WebSocket closed'));
        }
      };
    } catch (e) {
      subject.error(e as any);
    }

    return subject.asObservable();
  }

  /**
   * INTERNAL: Poll the results endpoint until it returns ready.
   * Polls `${apiBase}/results/:jobId` every 1.2s and resolves with resultId when ready.
   * Expects response shape to include { ready: boolean, resultId?: string } or 200 with result payload containing id.
   */
  private pollForResult(jobId: string): Observable<string> {
    const stop$ = new Subject<void>();
    const poller$ = interval(1200).pipe(
      takeUntil(stop$),
      switchMap(() => this.api.get<any>(`/results/${encodeURIComponent(jobId)}`).pipe(
        catchError(() => of(null))
      )),
      map((resp) => {
        if (!resp) return { ready: false } as any;
        // Accept various shapes: { ready, resultId }, or full result { id }, or {status:'done', id}
        const ready = !!(resp.ready || resp.status === 'done' || resp.done || resp.completed);
        const rid = resp.resultId || resp.id || resp.jobId || null;
        return { ready, rid };
      }),
      tap((st) => {
        if (st.ready && st.rid) {
          stop$.next();
          stop$.complete();
        }
      }),
      filter((st) => st.ready && !!st.rid),
      first(),
      map((st) => String(st.rid)),
    );

    return poller$;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private normalizeError(err: any): string {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err.message) return String(err.message);
    if (err.error && typeof err.error === 'string') return err.error;
    return 'Unexpected error';
  }
}
