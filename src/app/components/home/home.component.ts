import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  duesForm: FormGroup;
  duesHistory: any = null;
  garbageStatus: any = null;
  loading = false;
  error = '';
  statusClass = {
    'paid': 'status-paid',
    'pending': 'status-pending',
    'overdue': 'status-overdue'
  };

  // Pagination properties
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  paginatedDuesHistory: any[] = [];

  Math = Math;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) {
    this.duesForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
  }

  getDuesHistory() {
    if (this.duesForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.currentPage = 1;

    const accountNumber = this.duesForm.get('accountNumber')?.value;

    forkJoin({
      dues: this.dataService.getMonthlyDuesHistory(accountNumber),
      garbage: this.dataService.getGarbageCollectionStatus(accountNumber)
    }).subscribe({
      next: (response) => {
        this.duesHistory = response.dues;
        this.garbageStatus = response.garbage.garbageCollectionStatus;
        this.loading = false;

        if (this.duesHistory && this.duesHistory.duesHistory) {
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
    if (!this.duesHistory || !this.duesHistory.duesHistory || !this.duesHistory.duesHistory.length) {
      this.totalPages = 0;
      this.paginatedDuesHistory = [];
      return;
    }

    this.totalPages = Math.ceil(this.duesHistory.duesHistory.length / this.pageSize);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.duesHistory.duesHistory.length);
    this.paginatedDuesHistory = this.duesHistory.duesHistory.slice(startIndex, endIndex);
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

  getFormattedDate(dateString: string): string {
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
}