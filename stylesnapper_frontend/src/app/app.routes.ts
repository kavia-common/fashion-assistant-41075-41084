import { Routes } from '@angular/router';
import { AppShellComponent } from './shell/app-shell.component';

// Core pages
import { HomePage } from './pages/home.page';
import { UploadPage } from './pages/upload.page';
import { DiscoverPage } from './pages/discover.page';
import { ProfilePage } from './pages/profile.page';

// Newly added pages (placeholders)
import { ResultsPage } from './pages/results.page';
import { ProductPage } from './pages/product.page';
import { SearchPage } from './pages/search.page';
import { CartPage } from './pages/cart.page';
import { LoginPage } from './pages/login.page';
import { SignupPage } from './pages/signup.page';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      // Primary
      { path: '', component: HomePage },
      { path: 'upload', component: UploadPage },
      { path: 'discover', component: DiscoverPage },
      { path: 'profile', component: ProfilePage },

      // Additional required routes
      { path: 'results/:id', component: ResultsPage },
      { path: 'product/:id', component: ProductPage },
      { path: 'search', component: SearchPage },
      { path: 'cart', component: CartPage },
      { path: 'login', component: LoginPage },
      { path: 'signup', component: SignupPage },

      // Fallback
      { path: '**', redirectTo: '' },
    ],
  },
];
