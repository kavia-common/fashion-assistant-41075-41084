import { Component, Inject, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { UploadService, UploadProgressEvent } from '../core/http/upload.service';
import { AppStore } from '../core/state/app-store.service';

/**
 * UploadPage
 * Allows selecting or capturing a photo, shows upload progress, and navigates to the Results page upon completion.
 * SSR-safe: All browser APIs are guarded behind isPlatformBrowser checks.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, NgIf, LoadingSpinnerComponent],
  template: `
    <section class="card elev-1">
      <h2>Upload</h2>
      <p>Upload a photo to analyze your outfit.</p>

      <div class="mt-3" *ngIf="!inProgress(); else progressTpl">
        <div class="form-col">
          <label class="mb-2">Choose an image</label>
          <input
            type="file"
            accept="image/*"
            [attr.capture]="canUseCapture() ? 'environment' : null"
            (change)="onFileSelected($event)"
          />
          <small class="mt-1" style="display:block;color:rgba(17,24,39,0.7)">
            Supports JPG/PNG. For best results, capture a clear photo.
          </small>
        </div>
      </div>

      <ng-template #progressTpl>
        <div class="mt-3">
          <app-loading-spinner [size]="20">Uploading ({{ progress() }}%)</app-loading-spinner>
          <div class="mt-2" *ngIf="statusMsg()">{{ statusMsg() }}</div>
        </div>
      </ng-template>

      <div class="mt-3" *ngIf="errorMsg()">
        <small class="text-error">{{ errorMsg() }}</small>
      </div>
    </section>
  `
})
export class UploadPage {
  private readonly upload = inject(UploadService);
  private readonly router = inject(Router);
  private readonly store = inject(AppStore);
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  inProgress = signal(false);
  progress = signal(0);
  statusMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  canUseCapture(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async onFileSelected(ev: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return; // SSR guard

    const input = ev?.target as any;
    if (!input || !input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.errorMsg.set(null);
    this.statusMsg.set('Preparing upload…');
    this.inProgress.set(true);
    this.progress.set(0);
    this.store.setLoading(true);

    this.upload.uploadImage(file).subscribe({
      next: (e: UploadProgressEvent) => {
        if (typeof e.progress === 'number') {
          this.progress.set(Math.max(0, Math.min(100, e.progress)));
        }
        if (e.message) {
          this.statusMsg.set(e.message);
        }
        if (e.done && e.resultId) {
          // Navigate to results page; prefer explicit resultId if provided; fall back to jobId
          const id = e.resultId || e.jobId!;
          this.router.navigate(['/results', id]);
        }
      },
      error: (err) => {
        const msg = (err && err.message) ? err.message : 'Upload failed.';
        this.errorMsg.set(msg);
        this.inProgress.set(false);
        this.store.setLoading(false);
      },
      complete: () => {
        this.inProgress.set(false);
        this.store.setLoading(false);
      }
    });
  }
}
