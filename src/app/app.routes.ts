import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [

    {
        path: 'homeowners',
        children: [
            {
                path: 'payment-check',
                loadComponent: () =>
                    import('./components/home/home.component').then(m => m.HomeComponent)
            }
        ]
    },

    { path: '**', component: HomeComponent }
];
