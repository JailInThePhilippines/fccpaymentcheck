export interface DuesHistoryResponse {
  success: boolean;
  homeowner: {
    accountNumber: string;
    name: string;
    moveInDate: string;
    effectivePaymentStartDate: string;
    isLateMonthMoveIn: boolean;
  };
  currentMonthStatus: {
    exists: boolean;
    status: string;
    dueDate?: string;
    duesAmount?: number;
    paymentDate?: string;
    paymentMethod?: string;
    receiptNumber?: string;
    message: string;
    moveInDate?: string;
    effectivePaymentStartDate?: string;
    isLateMonthMoveIn?: boolean;
  };
  allMonths: Array<{
    year: number;
    month: number;
    monthName: string;
    status: string;
    duesAmount: number;
    paymentDate?: string | null;
    dueDate?: string | null;
    paymentMethod?: string | null;
    receiptNumber?: string | null;
    remarks?: string | null;
    message?: string;
    _id?: string;
  }>;
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
    totalUpcoming: number;
    totalUnpaid: number;
    amountPaid: number;
    amountPending: number;
    amountOverdue: number;
  };
  count: number;
  paymentInfo: {
    effectivePaymentStartDate: string;
    isCurrentMonthExempt: boolean;
    exemptionReason: string | null;
  };
}

export interface LoginCredentials {
  accountnumber: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: Homeowner;
}

export interface Homeowner {
  _id: string;
  accountnumber: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  suffix?: string;
  email: string;
  birthdate: string;
  role: string;
  phone: string;
  address: {
    street?: string;
    block?: string;
    lot?: string;
    phase?: string;
  };
  moveInDate: string;
  qrCode?: string;
  qrCodeActivated: boolean;
  accountCreated: boolean;
  currentlyLogin: number;
}