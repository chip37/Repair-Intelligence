export type RepairRecord = {
  id: string;
  machine_name?: string | null;
  machine_model?: string | null;
  machine_serial?: string | null;
  symptom?: string | null;
  root_cause?: string | null;
  resolution?: string | null;
  parts_replaced?: string | null;
  downtime_minutes?: number | null;
  technician_name?: string | null;
  repair_date?: string | null;
  notes?: string | null;
};

export const MATCH_FIELDS = [
  "symptom",
  "root_cause",
  "resolution",
  "parts_replaced",
  "machine_name",
] as const;

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "been",
  "being",
  "can",
  "does",
  "for",
  "from",
  "has",
  "have",
  "into",
  "machine",
  "not",
  "our",
  "out",
  "repair",
  "that",
  "the",
  "this",
  "with",
  "wire",
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function tokenize(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function repairSearchText(repair: RepairRecord) {
  return MATCH_FIELDS.map((field) => repair[field] || "").join(" ");
}

export function searchTermsForText(value: string, limit = 12) {
  return Array.from(new Set(tokenize(value))).slice(0, limit);
}

export function searchTermsForRepair(repair: RepairRecord, limit = 12) {
  return searchTermsForText(repairSearchText(repair), limit);
}

export function buildRepairOrQuery(terms: string[]) {
  return terms
    .map((term) =>
      MATCH_FIELDS.map((field) => `${field}.ilike.%${term}%`).join(",")
    )
    .join(",");
}

export function scoreRepairMatch(query: string, repair: RepairRecord) {
  const terms = searchTermsForText(query, 20);
  const fieldWeights: Record<(typeof MATCH_FIELDS)[number], number> = {
    symptom: 4,
    root_cause: 3,
    resolution: 3,
    parts_replaced: 2,
    machine_name: 2,
  };

  return terms.reduce((score, term) => {
    return (
      score +
      MATCH_FIELDS.reduce((fieldScore, field) => {
        const value = normalize(repair[field] || "");
        return value.includes(term) ? fieldScore + fieldWeights[field] : fieldScore;
      }, 0)
    );
  }, 0);
}

export function rankRepairs(query: string, repairs: RepairRecord[], limit = 5) {
  return repairs
    .map((repair) => ({ repair, score: scoreRepairMatch(query, repair) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (b.repair.repair_date || "").localeCompare(a.repair.repair_date || "");
    })
    .slice(0, limit)
    .map(({ repair }) => repair);
}
