import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  duesHistory: any = null;
  garbageStatus: any = null;
  loading = false;
  error = '';
  accountNumber: string = '';
  statusClass = {
    'paid': 'status-paid',
    'pending': 'status-pending',
    'overdue': 'status-overdue',
    'upcoming': 'status-upcoming',
    'unpaid': 'status-unpaid'
  };
  isDownloading = false;

  // Pagination properties
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  paginatedDuesHistory: any[] = [];

  Math = Math;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getAccountNumberFromToken();
    if (this.accountNumber) {
      this.getDuesHistory();
    } else {
      this.error = 'Unable to retrieve account number. Please log in again.';
    }
  }

  getAccountNumberFromToken(): void {
    try {
      const token = this.authService.getAccessToken();
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        this.accountNumber = decoded.user.accountnumber;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      this.error = 'Invalid token. Please log in again.';
    }
  }

  downloadSOA() {
    if (!this.accountNumber) {
      this.error = 'Account number not found';
      return;
    }

    this.isDownloading = true;

    this.dataService.getStatementOfAccount(this.accountNumber).subscribe({
      next: (pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SOA_${this.accountNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
      },
      error: (err) => {
        this.isDownloading = false;
        this.error = err.error?.message || 'Failed to download SOA';
      }
    });
  }

  getDuesHistory() {
    if (!this.accountNumber) {
      this.error = 'Account number not found';
      return;
    }

    this.loading = true;
    this.error = '';
    this.currentPage = 1;

    forkJoin({
      dues: this.dataService.getMonthlyDuesHistory(this.accountNumber),
      garbage: this.dataService.getGarbageCollectionStatus(this.accountNumber)
    }).subscribe({
      next: (response) => {
        this.duesHistory = response.dues;
        this.garbageStatus = response.garbage.garbageCollectionStatus;
        this.loading = false;

        if (this.duesHistory && this.duesHistory.allMonths) {
          this.setUpPagination();
        }
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to fetch homeowner data';
        this.loading = false;
      }
    });
  }

  setUpPagination(): void {
    if (!this.duesHistory || !this.duesHistory.allMonths || !this.duesHistory.allMonths.length) {
      this.totalPages = 0;
      this.paginatedDuesHistory = [];
      return;
    }

    this.totalPages = Math.ceil(this.duesHistory.allMonths.length / this.pageSize);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.duesHistory.allMonths.length);
    this.paginatedDuesHistory = this.duesHistory.allMonths.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getStatusClass(status: string): string {
    return this.statusClass[status as keyof typeof this.statusClass] || '';
  }

  getFormattedDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalVisiblePages = 5;

    if (this.totalPages <= totalVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 1);
      let endPage = Math.min(this.totalPages, this.currentPage + 1);

      if (startPage <= 2) {
        startPage = 1;
        endPage = Math.min(startPage + totalVisiblePages - 1, this.totalPages);
      } else if (endPage >= this.totalPages - 1) {
        endPage = this.totalPages;
        startPage = Math.max(endPage - totalVisiblePages + 1, 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (startPage > 1) {
        pages.unshift(-1);
        pages.unshift(1);
      }

      if (endPage < this.totalPages) {
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getMonthYear(payment: any): string {
    return `${payment.monthName} ${payment.year}`;
  }
}