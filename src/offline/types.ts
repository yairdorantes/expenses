export type SyncState = "synced" | "pending" | "failed";

export type PendingOperation = "create" | "update" | "delete" | null;

export interface ExpenseFormValues {
  amount: number | string;
  category: string;
  type: string;
  date: string;
  paymentMethod: string;
  details: string;
  account: string;
}

export interface LocalExpense extends ExpenseFormValues {
  localId: string;
  serverId: number | null;
  clientId: string;
  amount: number;
  categoryName?: string;
  syncState: SyncState;
  pendingOperation: PendingOperation;
  deleted: boolean;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
}

export interface ServerExpense {
  id: number;
  clientId?: string;
  client_id?: string;
  amount: number | string;
  type: string;
  category: string;
  categoryName?: string;
  date: string;
  paymentMethod: string;
  details?: string | null;
  account: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppConfig {
  totalSavings: number;
  fortnightlyBudget: number;
  closingDate?: string | null;
}

export interface FormOptions {
  categories: SelectOption[];
  types: SelectOption[];
  config?: AppConfig;
}

export interface PeriodData {
  movements: LocalExpense[];
  spent: number;
  remaining: number;
  previous_balance: number;
  config: AppConfig;
  source: "local" | "server";
}

export interface ClassifiedError {
  type: "offline" | "server" | "timeout" | "validation" | "unknown";
  message: string;
  status?: number;
}
