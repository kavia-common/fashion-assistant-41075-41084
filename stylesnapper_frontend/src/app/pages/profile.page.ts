import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [NgIf],
  template: `
    <section class="card elev-1">
      <h2>Profile</h2>

      <div class="mt-2" *ngIf="user(); else noUser">
        <p><strong>Name:</strong> {{ user()?.name }}</p>
        <p><strong>Email:</strong> {{ user()?.email || '—' }}</p>

        <div class="mt-3">
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </div>

      <ng-template #noUser>
        <p>You are not signed in.</p>
      </ng-template>
    </section>
  `
})
export class ProfilePage {
  private auth = inject(AuthService);
  user = computed(() => this.auth.currentUser()());
  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
