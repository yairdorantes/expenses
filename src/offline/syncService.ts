import { apiClient, classifyApiError } from "./apiClient";
import { localDb } from "./localDb";
import type { LocalExpense, ServerExpense, SyncState } from "./types";

const maxDelayMs = 60_000;
let retryDelayMs = 1_000;
let syncTimer: number | null = null;
let isSyncing = false;

const toServerPayload = (expense: LocalExpense) => ({
  clientId: expense.clientId,
  amount: expense.amount,
  category: expense.category,
  type: expense.type,
  date: expense.date,
  paymentMethod: expense.paymentMethod,
  details: expense.details,
  account: expense.account,
});

const firstServerExpense = (response: ServerExpense | ServerExpense[] | string) => {
  if (Array.isArray(response)) return response[0] || null;
  if (typeof response === "string") return null;
  return response;
};

const mergeServerFields = (local: LocalExpense, server: ServerExpense | null): LocalExpense => {
  const now = new Date().toISOString();

  return {
    ...local,
    serverId: server?.id ?? local.serverId,
    clientId: server?.clientId || server?.client_id || local.clientId,
    amount: Number(server?.amount ?? local.amount),
    category: server?.category ?? local.category,
    categoryName: server?.categoryName ?? local.categoryName,
    type: server?.type ?? local.type,
    date: server?.date ?? local.date,
    paymentMethod: server?.paymentMethod ?? local.paymentMethod,
    details: server?.details ?? local.details,
    account: server?.account ?? local.account,
    syncState: "synced",
    pendingOperation: null,
    deleted: false,
    syncError: undefined,
    createdAt: server?.createdAt || local.createdAt,
    updatedAt: server?.updatedAt || now,
    lastSyncedAt: now,
  };
};

const markFailed = async (
  expense: LocalExpense,
  error: unknown,
  syncState: SyncState = "failed"
) => {
  const classified = classifyApiError(error);
  await localDb.saveExpense({
    ...expense,
    syncState,
    syncError: syncState === "failed" ? classified.message : undefined,
    updatedAt: new Date().toISOString(),
  });
};

export const scheduleSync = (delayMs = retryDelayMs) => {
  if (syncTimer !== null) {
    window.clearTimeout(syncTimer);
  }

  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncService.syncPending();
  }, delayMs);
};

export const syncService = {
  async syncPending() {
    if (isSyncing || !navigator.onLine) {
      if (!navigator.onLine) scheduleSync(maxDelayMs);
      return;
    }

    isSyncing = true;
    const pending = await localDb.getPendingExpenses();
    let hadRetryableFailure = false;

    for (const expense of pending) {
      try {
        if (expense.pendingOperation === "delete") {
          if (expense.serverId) {
            await apiClient.deleteExpense(expense.serverId);
          }
          await localDb.deleteExpense(expense.localId);
          continue;
        }

        if (expense.pendingOperation === "create" || !expense.serverId) {
          const response = await apiClient.createExpense(toServerPayload(expense));
          await localDb.saveExpense(mergeServerFields(expense, firstServerExpense(response)));
          continue;
        }

        if (expense.pendingOperation === "update") {
          const response = await apiClient.updateExpense(expense.serverId, toServerPayload(expense));
          await localDb.saveExpense(mergeServerFields(expense, response));
        }
      } catch (error) {
        const classified = classifyApiError(error);
        const isValidation = classified.type === "validation";
        hadRetryableFailure = hadRetryableFailure || !isValidation;
        await markFailed(expense, error, isValidation ? "failed" : "pending");
      }
    }

    isSyncing = false;

    if (hadRetryableFailure) {
      retryDelayMs = Math.min(retryDelayMs * 2, maxDelayMs);
      scheduleSync(retryDelayMs);
      return;
    }

    retryDelayMs = 1_000;
  },
};

window.addEventListener("online", () => {
  retryDelayMs = 1_000;
  scheduleSync(500);
});
