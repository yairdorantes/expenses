import { fallbackCategories } from "../features/categories";
import { apiClient, classifyApiError } from "./apiClient";
import { localDb } from "./localDb";
import { scheduleSync, syncService } from "./syncService";
import type {
  ExpenseFormValues,
  FormOptions,
  LocalExpense,
  PeriodData,
  ServerExpense,
  SyncState,
} from "./types";

const expenseTransactionId = "1";
const lendMoneyCategoryId = "14";
const paycheckCategoryId = "16";
const defaultTotalSavings = 0;
const defaultFortnightlyBudget = 7500;

const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeDate = (value: string) => value.slice(0, 10);

const toLocalExpense = (
  data: ExpenseFormValues,
  existing?: LocalExpense,
  syncState: SyncState = "pending"
): LocalExpense => {
  const now = new Date().toISOString();

  return {
    localId: existing?.localId || uuid(),
    serverId: existing?.serverId ?? null,
    clientId: existing?.clientId || uuid(),
    amount: Number(data.amount),
    category: data.category,
    type: data.type,
    date: normalizeDate(data.date),
    paymentMethod: data.paymentMethod,
    details: data.details || "",
    account: data.account,
    categoryName: existing?.categoryName,
    syncState,
    pendingOperation: existing?.serverId ? "update" : "create",
    deleted: false,
    syncError: undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastSyncedAt: existing?.lastSyncedAt,
  };
};

const serverToLocalExpense = (server: ServerExpense, existing?: LocalExpense): LocalExpense => {
  const now = new Date().toISOString();

  return {
    localId: existing?.localId || uuid(),
    serverId: server.id,
    clientId: server.clientId || server.client_id || existing?.clientId || uuid(),
    amount: Number(server.amount),
    category: server.category,
    type: server.type,
    date: normalizeDate(server.date),
    paymentMethod: server.paymentMethod,
    details: server.details || "",
    account: server.account,
    categoryName: server.categoryName,
    syncState: "synced",
    pendingOperation: null,
    deleted: false,
    syncError: undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastSyncedAt: now,
  };
};

const hasServerChanges = (server: ServerExpense, existing: LocalExpense) => {
  return (
    existing.serverId !== server.id ||
    existing.clientId !== (server.clientId || server.client_id || existing.clientId) ||
    existing.amount !== Number(server.amount) ||
    existing.category !== server.category ||
    existing.type !== server.type ||
    existing.date !== normalizeDate(server.date) ||
    existing.paymentMethod !== server.paymentMethod ||
    existing.details !== (server.details || "") ||
    existing.account !== server.account ||
    existing.categoryName !== server.categoryName ||
    existing.deleted
  );
};

const toFormValues = (expense: LocalExpense): ExpenseFormValues => ({
  amount: expense.amount,
  category: expense.category,
  type: expense.type,
  date: normalizeDate(expense.date),
  paymentMethod: expense.paymentMethod,
  details: expense.details,
  account: expense.account,
});

const dateInRange = (dateValue: string, start: Date, end: Date) => {
  const normalized = normalizeDate(dateValue);
  return normalized >= start.toISOString().slice(0, 10) && normalized <= end.toISOString().slice(0, 10);
};

const getPeriodRange = (period: number, month: number, year: number) => {
  if (period === 1) {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month - 1, 14),
    };
  }

  return {
    start: new Date(year, month - 1, 15),
    end: new Date(year, month, 0),
  };
};

const getPreviousPeriodRange = (period: number, month: number, year: number) => {
  if (period === 2) {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month - 1, 14),
    };
  }

  return {
    start: new Date(year, month - 2, 15),
    end: new Date(year, month - 1, 0),
  };
};

const calculatePeriodData = (expenses: LocalExpense[], period: number, month: number, year: number): PeriodData => {
  const activeExpenses = expenses.filter((expense) => !expense.deleted);
  const { start, end } = getPeriodRange(period, month, year);
  const previousRange = getPreviousPeriodRange(period, month, year);
  const movements = activeExpenses
    .filter((expense) => dateInRange(expense.date, start, end))
    .sort((a, b) => b.date.localeCompare(a.date));

  const spent = movements.reduce((total, expense) => {
    if (expense.type === expenseTransactionId && expense.category !== lendMoneyCategoryId) {
      return total + Number(expense.amount);
    }
    return total;
  }, 0);

  const previousSpent = activeExpenses.reduce((total, expense) => {
    if (
      dateInRange(expense.date, previousRange.start, previousRange.end) &&
      expense.type === expenseTransactionId &&
      expense.category !== lendMoneyCategoryId
    ) {
      return total + Number(expense.amount);
    }
    return total;
  }, 0);

  const allSpent = activeExpenses.reduce((total, expense) => {
    if (expense.type === expenseTransactionId) return total + Number(expense.amount);
    if (expense.type === "2" && expense.category !== paycheckCategoryId) return total - Number(expense.amount);
    return total;
  }, 0);

  const savings = activeExpenses.reduce((total, expense) => {
    if (expense.category === paycheckCategoryId) return total + Number(expense.amount);
    return total;
  }, defaultTotalSavings);

  return {
    movements,
    spent,
    remaining: savings - allSpent,
    previous_balance: defaultFortnightlyBudget - previousSpent,
    source: "local",
  };
};

const cacheServerMovements = async (movements: ServerExpense[]) => {
  for (const movement of movements) {
    const existing =
      (movement.clientId || movement.client_id
        ? await localDb.findExpenseByClientId(movement.clientId || movement.client_id || "")
        : null) || (await localDb.findExpenseByServerId(movement.id));

    if (existing && existing.syncState !== "synced") {
      continue;
    }

    if (!existing || hasServerChanges(movement, existing)) {
      await localDb.saveExpense(serverToLocalExpense(movement, existing), { silent: true });
    }
  }
};

export const expenseRepository = {
  async getPeriodSummary(period: number, month: number, year: number) {
    const localBeforeNetwork = calculatePeriodData(await localDb.getExpenses(), period, month, year);

    try {
      const serverData = await apiClient.getPeriod(period, month, year);
      await cacheServerMovements(serverData.movements || []);
      return calculatePeriodData(await localDb.getExpenses(), period, month, year);
    } catch (error) {
      return {
        ...localBeforeNetwork,
        error: classifyApiError(error),
      };
    }
  },

  async getExpense(localId: string) {
    return localDb.getExpense(localId);
  },

  async getFormOptions() {
    const cached = await localDb.getFormOptions();

    try {
      const serverOptions = await apiClient.getFormOptions();
      await localDb.saveFormOptions(serverOptions);
      return serverOptions;
    } catch (error) {
      if (cached) return cached;
      return {
        categories: fallbackCategories,
        types: [
          { value: "1", label: "Expense" },
          { value: "2", label: "Income" },
        ],
      } satisfies FormOptions;
    }
  },

  async createExpense(values: ExpenseFormValues) {
    const localExpense = toLocalExpense(values);
    await localDb.saveExpense(localExpense);
    scheduleSync(100);
    return localExpense;
  },

  async updateExpense(localId: string, values: ExpenseFormValues) {
    const existing = await localDb.getExpense(localId);
    if (!existing) throw new Error("Expense not found locally.");

    const localExpense = {
      ...toLocalExpense(values, existing),
      pendingOperation: existing.pendingOperation === "create" ? "create" : "update",
    } satisfies LocalExpense;

    await localDb.saveExpense(localExpense);
    scheduleSync(100);
    return localExpense;
  },

  async deleteExpense(localId: string) {
    const existing = await localDb.getExpense(localId);
    if (!existing) return;

    if (!existing.serverId && existing.pendingOperation === "create") {
      await localDb.deleteExpense(localId);
      return;
    }

    await localDb.saveExpense({
      ...existing,
      deleted: true,
      syncState: "pending",
      pendingOperation: "delete",
      updatedAt: new Date().toISOString(),
    });
    scheduleSync(100);
  },

  async refreshFormOptions() {
    return this.getFormOptions();
  },

  async processRecurringTransactions() {
    try {
      await apiClient.processRecurringTransactions();
      await syncService.syncPending();
    } catch (error) {
      return classifyApiError(error);
    }
  },

  toFormValues,
};
