import axios, { AxiosError } from "axios";
import type { ClassifiedError, ExpenseFormValues, FormOptions, ServerExpense } from "./types";

const apiUrl = import.meta.env.VITE_API_URL;
const timeoutMs = 10_000;

const client = axios.create({
  baseURL: apiUrl,
  timeout: timeoutMs,
});

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const classifyApiError = (error: unknown): ClassifiedError => {
  if (!navigator.onLine) {
    return {
      type: "offline",
      message: "No internet connection. Your changes were saved locally.",
    };
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;

    if (axiosError.code === "ECONNABORTED") {
      return {
        type: "timeout",
        message: "The server took too long to respond. The app will retry later.",
      };
    }

    if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
      return {
        type: "validation",
        status: axiosError.response.status,
        message:
          axiosError.response.data?.error ||
          axiosError.response.data?.message ||
          "The server rejected this change. Please review the expense details.",
      };
    }

    if (!axiosError.response || axiosError.response.status >= 500) {
      return {
        type: "server",
        status: axiosError.response?.status,
        message: "The server is unavailable. The app will keep using local data.",
      };
    }
  }

  return {
    type: "unknown",
    message: "Something went wrong. The app will keep using local data.",
  };
};

const withRetry = async <T>(operation: () => Promise<T>, attempts = 3): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classified = classifyApiError(error);

      if (classified.type === "validation") {
        throw error;
      }

      if (attempt < attempts - 1) {
        await wait(500 * 2 ** attempt);
      }
    }
  }

  throw lastError;
};

export const apiClient = {
  async getPeriod(period: number, month: number, year: number) {
    const response = await withRetry(() =>
      client.get(`/api/period/${period}/${month}/${year}`)
    );
    return response.data as { movements: ServerExpense[] };
  },

  async getExpense(serverId: number) {
    const response = await withRetry(() => client.get(`/api/expenses/${serverId}`));
    return response.data as ServerExpense;
  },

  async getFormOptions() {
    const response = await withRetry(() => client.get("/api/form"));
    return response.data as FormOptions;
  },

  async createExpense(payload: ExpenseFormValues & { clientId: string }) {
    const response = await withRetry(() => client.post("/api/expenses", payload));
    return response.data as ServerExpense | ServerExpense[] | string;
  },

  async updateExpense(serverId: number, payload: ExpenseFormValues & { clientId: string }) {
    const response = await withRetry(() => client.put(`/api/expenses/${serverId}`, payload));
    return response.data as ServerExpense;
  },

  async deleteExpense(serverId: number) {
    await withRetry(() => client.delete(`/api/expenses/${serverId}`));
  },

  async processRecurringTransactions() {
    await withRetry(() => client.post("/api/recurrent_txs"), 2);
  },
};
