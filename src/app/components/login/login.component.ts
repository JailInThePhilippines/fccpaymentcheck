import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      accountnumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Check for logout reason and display it
    const logoutReason = sessionStorage.getItem('logoutReason');
    if (logoutReason) {
      this.setLogoutMessage(logoutReason);
      sessionStorage.removeItem('logoutReason');
    }

    // If already logged in, redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/homeowners/payment-check']);
    }
  }

  setLogoutMessage(reason: string): void {
    const messages: { [key: string]: string } = {
      'SESSION_INVALIDATED': 'Your session has been invalidated by an administrator. Please log in again.',
      'SESSION_EXPIRED': 'Your session has expired. Please log in again.',
      'ACCOUNT_DEACTIVATED': 'Your account has been deactivated. Please contact support.',
      'TOKEN_REFRESH_FAILED': 'Your session has expired. Please log in again.',
      'REFRESH_TOKEN_EXPIRED': 'Your session has expired. Please log in again.'
    };

    this.errorMessage = messages[reason] || 'Please log in to continue.';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/homeowners/payment-check']);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.isLoading = false;

        // Handle different error messages
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid account number or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again later.';
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);

    if (control?.hasError('required') && control.touched) {
      return `${fieldName === 'accountnumber' ? 'Account number' : 'Password'} is required`;
    }

    if (control?.hasError('minlength') && control.touched) {
      return 'Password must be at least 6 characters';
    }

    return '';
  }
}
