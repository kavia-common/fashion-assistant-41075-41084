import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="card elev-1">
      <h2>Login</h2>
      <div class="mt-3 form-col">
        <label class="mb-2">Email</label>
        <input type="email" placeholder="you@example.com" />
      </div>
      <div class="mt-3 form-col">
        <label class="mb-2">Password</label>
        <input type="password" placeholder="••••••••" />
      </div>
      <div class="mt-3">
        <button class="btn">Sign in</button>
        <a class="btn btn-outline ml-2" [routerLink]="['/signup']">Create account</a>
      </div>
    </section>
  `
})
export class LoginPage {}
