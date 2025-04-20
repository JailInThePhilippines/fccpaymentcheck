export interface DuesHistoryResponse {
    success: boolean;
    homeowner: {
      accountNumber: string;
      name: string;
    };
    currentMonthStatus: {
      exists: boolean;
      status: string;
      dueDate: string;
      duesAmount: number;
      message: string;
    };
    duesHistory: Array<{
      _id: string;
      duesAmount: number;
      paymentDate: string;
      paymentStatus: string;
      dueDate: string;
      paymentMethod: string;
      receiptNumber: string;
      remarks: string;
    }>;
    summary: {
      totalPaid: number;
      totalPending: number;
      totalOverdue: number;
      amountPaid: number;
      amountPending: number;
      amountOverdue: number;
    };
    count: number;
  }