import {
  DEFAULT_INFRA_COST_TABLE,
  INFRA_COST_TABLE_STORAGE_KEY,
  type InfraCostTableDoc,
} from "./presentation-materials";

function isInfraCostTableDoc(value: unknown): value is InfraCostTableDoc {
  if (!value || typeof value !== "object") return false;
  const doc = value as InfraCostTableDoc;
  return (
    typeof doc.title === "string" &&
    Array.isArray(doc.columns) &&
    doc.columns.length === 5 &&
    Array.isArray(doc.rows) &&
    doc.rows.every(
      (row) =>
        typeof row.id === "string" &&
        Array.isArray(row.cells) &&
        row.cells.length === 5 &&
        row.cells.every((cell) => typeof cell === "string")
    )
  );
}

export function loadInfraCostTable(): InfraCostTableDoc {
  if (typeof window === "undefined") return DEFAULT_INFRA_COST_TABLE;
  try {
    const raw = localStorage.getItem(INFRA_COST_TABLE_STORAGE_KEY);
    if (!raw) return DEFAULT_INFRA_COST_TABLE;
    const parsed: unknown = JSON.parse(raw);
    return isInfraCostTableDoc(parsed) ? parsed : DEFAULT_INFRA_COST_TABLE;
  } catch {
    return DEFAULT_INFRA_COST_TABLE;
  }
}

export function saveInfraCostTable(doc: InfraCostTableDoc): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INFRA_COST_TABLE_STORAGE_KEY, JSON.stringify(doc));
}

export function resetInfraCostTable(): InfraCostTableDoc {
  saveInfraCostTable(DEFAULT_INFRA_COST_TABLE);
  return DEFAULT_INFRA_COST_TABLE;
}
