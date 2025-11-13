import { Routes } from '@angular/router';
import { AppShellComponent } from './shell/app-shell.component';
import { HomePage } from './pages/home.page';
import { UploadPage } from './pages/upload.page';
import { DiscoverPage } from './pages/discover.page';
import { ProfilePage } from './pages/profile.page';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', component: HomePage },
      { path: 'upload', component: UploadPage },
      { path: 'discover', component: DiscoverPage },
      { path: 'profile', component: ProfilePage },
      { path: '**', redirectTo: '' },
    ],
  },
];
