import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="card elev-1">
      <h2>Sign up</h2>
      <div class="mt-3 form-row">
        <div class="form-col">
          <label class="mb-2">Name</label>
          <input type="text" placeholder="Full name" />
        </div>
        <div class="form-col">
          <label class="mb-2">Email</label>
          <input type="email" placeholder="you@example.com" />
        </div>
      </div>
      <div class="mt-3 form-col">
        <label class="mb-2">Password</label>
        <input type="password" placeholder="Create a password" />
      </div>
      <div class="mt-3">
        <button class="btn">Create account</button>
        <a class="btn btn-outline ml-2" [routerLink]="['/login']">Sign in</a>
      </div>
    </section>
  `
})
export class SignupPage {}
