import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.css'
})
export class CompleteProfileComponent implements OnInit {
  currentStep = 1;
  isEditing = false;
  isLoading = true;
  homeownerId: string = '';
  isSubmitting = false;
  errorMessage: string = '';
  successMessage: string = '';

  formData = {
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    phone: ''
  };

  passwordData = {
    password: '',
    confirmPassword: ''
  };

  passwordStrength = {
    score: 0,
    label: '',
    color: ''
  };

  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get homeowner ID from route params - matching your route parameter name
    this.homeownerId = this.route.snapshot.params['homeownerId'];

    if (this.homeownerId) {
      this.loadDetails();
    } else {
      console.error('No homeowner ID found in route');
      this.isLoading = false;
    }
  }

  loadDetails(): void {
    this.isLoading = true;

    this.dataService.getDetails(this.homeownerId).subscribe({
      next: (response) => {
        if (response && response.homeowner) {
          const homeowner = response.homeowner;

          // Prefill the form with the fetched data
          this.formData = {
            firstName: homeowner.firstname || '',
            middleName: homeowner.middlename || '',
            lastName: homeowner.lastname || '',
            suffix: '', // Not in your API response
            email: homeowner.email || '',
            phone: homeowner.phone || ''
          };

          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading homeowner details:', error);
        this.isLoading = false;
        // You might want to show an error message to the user
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  nextStep() {
    if (this.validateStep1()) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    this.currentStep = 1;
  }

  validateStep1(): boolean {
    return !!(this.formData.firstName && this.formData.lastName && this.formData.email);
  }

  checkPasswordStrength() {
    const password = this.passwordData.password;

    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
    this.passwordRequirements.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    if (this.passwordRequirements.minLength) score++;
    if (this.passwordRequirements.hasUppercase) score++;
    if (this.passwordRequirements.hasLowercase) score++;
    if (this.passwordRequirements.hasNumber) score++;
    if (this.passwordRequirements.hasSpecial) score++;

    if (score === 0) {
      this.passwordStrength = { score: 0, label: '', color: '' };
    } else if (score <= 2) {
      this.passwordStrength = { score: score, label: 'Weak', color: 'text-red-600' };
    } else if (score <= 4) {
      this.passwordStrength = { score: score, label: 'Medium', color: 'text-yellow-600' };
    } else {
      this.passwordStrength = { score: score, label: 'Strong', color: 'text-green-600' };
    }
  }

  passwordsMatch(): boolean {
    return this.passwordData.password === this.passwordData.confirmPassword &&
      this.passwordData.confirmPassword.length > 0;
  }

  isPasswordValid(): boolean {
    const allRequirementsMet = this.passwordRequirements.minLength &&
      this.passwordRequirements.hasUppercase &&
      this.passwordRequirements.hasLowercase &&
      this.passwordRequirements.hasNumber &&
      this.passwordRequirements.hasSpecial;
    return allRequirementsMet && this.passwordsMatch();
  }

  submitProfile() {
    if (this.isPasswordValid()) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const profileData = {
        homeownerId: this.homeownerId,
        password: this.passwordData.password,
        email: this.formData.email,
        phone: this.formData.phone
      };

      this.dataService.completeProfile(profileData).subscribe({
        next: (response) => {
          console.log('Profile completed successfully:', response);
          this.isSubmitting = false;
          this.successMessage = 'Profile completed successfully! Redirecting to login...';

          // Redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error completing profile:', error);
          this.isSubmitting = false;

          // Handle specific error cases
          if (error.status === 400) {
            if (error.error.redirect === '/account/created/true') {
              this.errorMessage = 'Account already created. Redirecting to login...';
              setTimeout(() => {
                this.router.navigate(['/auth/login']);
              }, 2000);
            } else {
              this.errorMessage = error.error.message || 'Unable to complete profile. Please check your information.';
            }
          } else if (error.status === 403) {
            this.errorMessage = 'QR code is not activated. Please contact support.';
          } else if (error.status === 404) {
            this.errorMessage = 'Homeowner not found.';
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
    }
  }

  cancel() {
    this.isEditing = false;
    this.loadDetails();
  }
}