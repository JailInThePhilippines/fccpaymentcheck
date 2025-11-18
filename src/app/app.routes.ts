import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Public routes (no auth required)
    {
        path: 'auth/login',
        loadComponent: () =>
            import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'verify/qr/:homeownerId',
        loadComponent: () =>
            import('./components/verifyqr/verifyqr.component').then(m => m.VerifyqrComponent)
    },
    {
        path: 'complete/profile/:homeownerId',
        loadComponent: () =>
            import('./components/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent)
    },
    {
        path: 'qr/inactive',
        loadComponent: () =>
            import('./components/inactive-qr/inactive-qr.component').then(m => m.InactiveQrComponent)
    },
    {
        path: 'account/created/true',
        loadComponent: () =>
            import('./components/account-created/account-created.component').then(m => m.AccountCreatedComponent)
    },

    // Protected routes (auth required)
    {
        path: 'homeowners',
        canActivate: [authGuard],
        children: [
            {
                path: 'payment-check',
                loadComponent: () =>
                    import('./components/home/home.component').then(m => m.HomeComponent)
            },
        ]
    },

    // Default redirect
    { 
        path: '', 
        redirectTo: '/auth/login', 
        pathMatch: 'full' 
    },
    
    // Wildcard route - redirect to login
    { 
        path: '**', 
        redirectTo: '/auth/login'
    }
];