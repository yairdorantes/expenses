import type { FormOptions, LocalExpense } from "./types";

const dbName = "expenses-offline-db";
const dbVersion = 1;
const expenseStore = "expenses";
const metadataStore = "metadata";

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(expenseStore)) {
        const store = db.createObjectStore(expenseStore, {
          keyPath: "localId",
        });
        store.createIndex("serverId", "serverId", { unique: false });
        store.createIndex("clientId", "clientId", { unique: true });
        store.createIndex("syncState", "syncState", { unique: false });
      }

      if (!db.objectStoreNames.contains(metadataStore)) {
        db.createObjectStore(metadataStore, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const transactionDone = (transaction: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

const broadcastChange = () => {
  window.dispatchEvent(new CustomEvent("expenses:local-change"));
};

export const localDb = {
  async getExpenses() {
    const db = await openDb();
    return requestToPromise<LocalExpense[]>(
      db
        .transaction(expenseStore, "readonly")
        .objectStore(expenseStore)
        .getAll(),
    );
  },

  async getExpense(localId: string) {
    const db = await openDb();
    const expense = await requestToPromise<LocalExpense | undefined>(
      db
        .transaction(expenseStore, "readonly")
        .objectStore(expenseStore)
        .get(localId),
    );
    return expense || null;
  },

  async findExpenseByServerId(serverId: number) {
    const db = await openDb();
    const expense = await requestToPromise<LocalExpense | undefined>(
      db
        .transaction(expenseStore, "readonly")
        .objectStore(expenseStore)
        .index("serverId")
        .get(serverId),
    );
    return expense || null;
  },

  async findExpenseByClientId(clientId: string) {
    const db = await openDb();
    const expense = await requestToPromise<LocalExpense | undefined>(
      db
        .transaction(expenseStore, "readonly")
        .objectStore(expenseStore)
        .index("clientId")
        .get(clientId),
    );
    return expense || null;
  },

  async saveExpense(expense: LocalExpense, options: { silent?: boolean } = {}) {
    const db = await openDb();
    const transaction = db.transaction(expenseStore, "readwrite");
    transaction.objectStore(expenseStore).put(expense);
    await transactionDone(transaction);
    if (!options.silent) broadcastChange();
  },

  async deleteExpense(localId: string) {
    const db = await openDb();
    const transaction = db.transaction(expenseStore, "readwrite");
    transaction.objectStore(expenseStore).delete(localId);
    await transactionDone(transaction);
    broadcastChange();
  },

  async getPendingExpenses() {
    const expenses = await this.getExpenses();
    return expenses.filter((expense) => expense.syncState !== "synced");
  },

  async getFormOptions() {
    const db = await openDb();
    const item = await requestToPromise<
      { key: string; value: FormOptions } | undefined
    >(
      db
        .transaction(metadataStore, "readonly")
        .objectStore(metadataStore)
        .get("formOptions"),
    );
    return item?.value || null;
  },

  async saveFormOptions(options: FormOptions) {
    const db = await openDb();
    const transaction = db.transaction(metadataStore, "readwrite");
    transaction
      .objectStore(metadataStore)
      .put({ key: "formOptions", value: options });
    await transactionDone(transaction);
  },
};
