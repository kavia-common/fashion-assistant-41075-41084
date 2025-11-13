import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../core/auth/auth.service';
import { AppStore } from '../core/state/app-store.service';
import { CommonModule } from '@angular/common';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  template: `
    <section class="card elev-1">
      <h2>Sign up</h2>

      <form class="mt-3" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-col">
            <label class="mb-2">Name</label>
            <input type="text" formControlName="name" placeholder="Full name" />
            <small class="text-error" *ngIf="submitted() && form.controls.name.invalid">Name is required.</small>
          </div>
          <div class="form-col">
            <label class="mb-2">Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com" />
            <small class="text-error" *ngIf="submitted() && form.controls.email.invalid">Enter a valid email.</small>
          </div>
        </div>

        <div class="mt-3 form-col">
          <label class="mb-2">Password</label>
          <input type="password" formControlName="password" placeholder="Create a password" />
          <small class="text-error" *ngIf="submitted() && form.controls.password.invalid">Password is required.</small>
        </div>

        <div class="mt-3">
          <button class="btn" type="submit" [disabled]="isLoading()">Create account</button>
          <a class="btn btn-outline ml-2" [routerLink]="['/login']">Sign in</a>
        </div>

        <div class="mt-3" *ngIf="errorMsg()">
          <small class="text-error">{{ errorMsg() }}</small>
        </div>
      </form>
    </section>
  `
})
export class SignupPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private store = inject(AppStore);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submitted = signal(false);
  errorMsg = signal<string | null>(null);
  isLoading = computed(() => this.store.isLoading()());

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMsg.set(null);
    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();
    try {
      await this.auth.signup(String(name), String(email), String(password));
    } catch (e: any) {
      const msg = (e && e.message) ? e.message : 'Failed to create account.';
      this.errorMsg.set(msg);
    }
  }
}
