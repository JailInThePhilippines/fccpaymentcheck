import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user: {
    id: string;
    role: string;
    sessionId: string;
    fullName: string;
    accountnumber: string;
  };
  iat: number;
  exp: number;
}

interface HomeownerDetails {
  _id: string;
  accountnumber: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  suffix?: string;
  birthdate: string;
  email: string;
  phone: string;
  address: {
    street: string;
    block: string;
    lot: string;
    phase: string;
  };
  isDeleted: boolean;
  accountCreatedAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  homeownerDetails: HomeownerDetails | null = null;
  loading = false;
  error = '';
  homeownerId: string = '';
  isSideMenuOpen = false;
  showLogoutConfirm = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getHomeownerIdFromToken();
    if (this.homeownerId) {
      this.loadHomeownerDetails();
    } else {
      this.error = 'Unable to retrieve user information. Please log in again.';
    }
  }

  getHomeownerIdFromToken(): void {
    try {
      const token = this.authService.getAccessToken();
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        this.homeownerId = decoded.user.id;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      this.error = 'Invalid token. Please log in again.';
    }
  }

  loadHomeownerDetails(): void {
    this.loading = true;
    this.error = '';

    this.dataService.getDetails(this.homeownerId).subscribe({
      next: (response) => {
        this.homeownerDetails = response.homeowner;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load profile details';
        this.loading = false;
      }
    });
  }

  getFullName(): string {
    if (!this.homeownerDetails) return '';
    const parts = [
      this.homeownerDetails.firstname,
      this.homeownerDetails.middlename,
      this.homeownerDetails.lastname,
      this.homeownerDetails.suffix
    ].filter(Boolean);
    return parts.join(' ');
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAccountAge(): string {
    if (!this.homeownerDetails?.accountCreatedAt) return '—';
    const created = new Date(this.homeownerDetails.accountCreatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  }

  getFullAddress(): string {
    if (!this.homeownerDetails?.address) return '—';
    const addr = this.homeownerDetails.address;
    return `${addr.street}, ${addr.block}, ${addr.lot} ${addr.phase}`;
  }

  navigateToDashboard(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/home']);
    this.isSideMenuOpen = false;
  }

  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  onLogout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.authService.clearAuth();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }
}