import debounce from "lodash.debounce";

export type MasterDataShape = {
  adminUsers?: unknown[];
  userCredentials?: Record<string, string>;
  employees?: unknown[];
  departments?: unknown[];
  leaveRequests?: unknown[];
  attendanceRecords?: unknown[];
  systemAssets?: unknown[];
  pcLaptopAssets?: unknown[];
  itAccounts?: unknown[];
  salaryRecords?: unknown[];
  pendingITNotifications?: unknown[];
};

function collectMasterData(): MasterDataShape {
  const get = (k: string, def: string) => JSON.parse(localStorage.getItem(k) || def);
  return {
    adminUsers: get("users", "[]"),
    userCredentials: get("userCredentials", "{}"),
    employees: get("hrEmployees", "[]"),
    departments: get("departments", "[]"),
    leaveRequests: get("leaveRequests", "[]"),
    attendanceRecords: get("attendanceRecords", "[]"),
    systemAssets: get("systemAssets", "[]"),
    pcLaptopAssets: get("pcLaptopAssets", "[]"),
    itAccounts: get("itAccounts", "[]"),
    salaryRecords: get("salaryRecords", "[]"),
    pendingITNotifications: get("pendingITNotifications", "[]"),
  };
}

async function trySync(): Promise<void> {
  const masterData = collectMasterData();
  try {
    await fetch("/api/google-sheets/sync-master-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterData }),
    });
  } catch {}
  try {
    await fetch("/api/google-sheets/sync-hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterData }),
    });
  } catch {}
}

const debouncedSync = debounce(trySync, 1500, { maxWait: 5000 });

export function setupAutoSync() {
  const origSet = localStorage.setItem.bind(localStorage);
  // Avoid double-wrapping
  if ((window as any).__autoSyncPatched) return;
  (window as any).__autoSyncPatched = true;
  localStorage.setItem = function (key: string, value: string) {
    origSet(key, value);
    // Only sync on known keys
    const watched = new Set([
      "users",
      "userCredentials",
      "hrEmployees",
      "departments",
      "leaveRequests",
      "attendanceRecords",
      "systemAssets",
      "pcLaptopAssets",
      "itAccounts",
      "salaryRecords",
      "pendingITNotifications",
    ]);
    if (watched.has(key)) debouncedSync();
  } as typeof localStorage.setItem;
}

export async function loadFromSheetsIfEmpty() {
  // If any key has data, skip auto-load
  const keys = [
    "hrEmployees",
    "systemAssets",
    "pcLaptopAssets",
    "itAccounts",
    "pendingITNotifications",
    "departments",
    "leaveRequests",
    "attendanceRecords",
    "salaryRecords",
  ];
  const hasAny = keys.some((k) => {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "[]");
      return Array.isArray(v) && v.length > 0;
    } catch {
      return false;
    }
  });
  if (hasAny) return;

  try {
    const it = await fetch("/api/google-sheets/load-it").then((r) => r.json());
    if (it?.success && it.data) {
      if (it.data.systemAssets) localStorage.setItem("systemAssets", JSON.stringify(it.data.systemAssets));
      if (it.data.pcLaptopAssets) localStorage.setItem("pcLaptopAssets", JSON.stringify(it.data.pcLaptopAssets));
      if (it.data.itAccounts) localStorage.setItem("itAccounts", JSON.stringify(it.data.itAccounts));
      if (it.data.pendingITNotifications) localStorage.setItem("pendingITNotifications", JSON.stringify(it.data.pendingITNotifications));
    }
  } catch {}

  try {
    const hr = await fetch("/api/google-sheets/load-hr").then((r) => r.json());
    if (hr?.success && hr.data) {
      if (hr.data.employees) localStorage.setItem("hrEmployees", JSON.stringify(hr.data.employees));
      if (hr.data.departments) localStorage.setItem("departments", JSON.stringify(hr.data.departments));
      if (hr.data.leaveRequests) localStorage.setItem("leaveRequests", JSON.stringify(hr.data.leaveRequests));
      if (hr.data.attendanceRecords) localStorage.setItem("attendanceRecords", JSON.stringify(hr.data.attendanceRecords));
      if (hr.data.salaryRecords) localStorage.setItem("salaryRecords", JSON.stringify(hr.data.salaryRecords));
    }
  } catch {}
}
