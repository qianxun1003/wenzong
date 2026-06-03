/** 演示模式 · 跨国联合办学缔结关系 localStorage 持久化 */

export interface CoOpPartnership {
  id: string;
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
  createdAt: string;
}

const COOP_PARTNERSHIPS_KEY = "wenzong_demo_coop_partnerships";

function readPartnerships(): CoOpPartnership[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COOP_PARTNERSHIPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CoOpPartnership[];
  } catch {
    return [];
  }
}

function writePartnerships(list: CoOpPartnership[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOP_PARTNERSHIPS_KEY, JSON.stringify(list));
}

export function loadCoOpPartnerships(): CoOpPartnership[] {
  return readPartnerships();
}

export function isCoOpPartnershipBound(sourceOrgId: string, targetOrgId: string): boolean {
  return readPartnerships().some(
    (p) => p.sourceOrgId === sourceOrgId && p.targetOrgId === targetOrgId
  );
}

export function addCoOpPartnership(input: {
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
}): CoOpPartnership {
  const created: CoOpPartnership = {
    id: `coop-${input.sourceOrgId}-${input.targetOrgId}-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  writePartnerships([created, ...readPartnerships()]);
  return created;
}

export function removeCoOpPartnership(partnershipId: string): boolean {
  const list = readPartnerships();
  const next = list.filter((p) => p.id !== partnershipId);
  if (next.length === list.length) return false;
  writePartnerships(next);
  return true;
}
