import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-verifyqr',
  imports: [CommonModule],
  templateUrl: './verifyqr.component.html',
  styleUrl: './verifyqr.component.css'
})
export class VerifyqrComponent implements OnInit {
  homeownerId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  countdown: number = 3;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    // Get homeownerId from route params
    this.homeownerId = this.route.snapshot.paramMap.get('homeownerId') || '';

    if (!this.homeownerId) {
      this.handleError('Invalid QR code. No homeowner ID found.');
      this.redirectAfterDelay('/qr/inactive');
      return;
    }

    // Verify the QR code
    this.verifyQRCode();
  }

  verifyQRCode(): void {
    console.log('Verifying homeownerId:', this.homeownerId);

    this.dataService.verifyQRCode(this.homeownerId).subscribe({
      next: (response) => {
        console.log('✅ Verification success:', response);
        this.isLoading = false;

        if (response.accountCreated) {
          this.successMessage = response.message || 'Your account is already activated!';
          this.redirectAfterDelay(response.redirect || '/account/created/true');
        } else {
          this.successMessage = response.message || 'QR code verified successfully!';
          this.redirectAfterDelay(`/complete/profile/${this.homeownerId}`);
        }
      },
      error: (error) => {
        console.error('❌ Verification error:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);

        this.isLoading = false;

        if (error.status === 404) {
          this.handleError('Invalid QR code. This code is not recognized.');
          this.redirectAfterDelay('/qr/inactive');
        } else if (error.status === 403) {
          this.handleError(error.error?.message || 'QR code is not activated. Please contact HOA Superadmin.');
          this.redirectAfterDelay('/qr/inactive');
        } else {
          this.handleError('An error occurred while verifying your QR code. Please try again.');
          this.redirectAfterDelay('/qr/inactive');
        }
      }
    });
  }

  handleError(message: string): void {
    this.errorMessage = message;
  }

  redirectAfterDelay(path: string): void {
    // Start countdown
    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(interval);
        this.router.navigate([path]);
      }
    }, 1000);
  }
}
