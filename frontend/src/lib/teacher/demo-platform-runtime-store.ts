/** 演示模式 · 运行时状态 sessionStorage 持久化（席位 / 通关记录） */

type OrgSlotState = { used: number; limit: number };

type CrossBorderTransferRecord = {
  id: string;
  studentCode: string;
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
  transferredAt: string;
};

const ORG_SLOTS_KEY = "wenzong_demo_org_slots";
const TRANSFERS_KEY = "wenzong_demo_transfers";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function loadPersistedOrgSlots(): Record<string, OrgSlotState> | null {
  const data = readJson<Record<string, OrgSlotState> | null>(ORG_SLOTS_KEY, null);
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

export function savePersistedOrgSlots(slots: Record<string, OrgSlotState>) {
  writeJson(ORG_SLOTS_KEY, slots);
}

export function loadPersistedTransfers(): CrossBorderTransferRecord[] {
  return readJson<CrossBorderTransferRecord[]>(TRANSFERS_KEY, []);
}

export function savePersistedTransfers(transfers: CrossBorderTransferRecord[]) {
  writeJson(TRANSFERS_KEY, transfers);
}

export function clearDemoRuntimeState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORG_SLOTS_KEY);
  sessionStorage.removeItem(TRANSFERS_KEY);
}
