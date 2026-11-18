import { describe, expect, it } from "vitest";
import { bucketOfRow, countDurationBuckets, LICENSE_DURATIONS } from "../src/lib/license-durations";

describe("license duration organization", () => {
  it("separates the one-hour trial from a one-day license", () => {
    expect(bucketOfRow({ tipo: "teste", duracao_dias: 1, trial_duracao_minutos: 60 })).toBe("teste");
    expect(bucketOfRow({ tipo: "teste", duracao_dias: 1, trial_duracao_minutos: 1440 })).toBe("1d");
  });
  it.each([
    [1, "1d"], [2, "2d"], [3, "3d"], [7, "7d"], [15, "15d"],
    [30, "30d"], [60, "60d"], [90, "90d"], [180, "180d"], [365, "1ano"],
  ] as const)("classifies %i days using saved days even with inconsistent trial minutes", (days, bucket) => {
    expect(bucketOfRow({ tipo: "teste", duracao_dias: days, trial_duracao_minutos: 4320 })).toBe(bucket);
  });
  it("counts the 82 existing licenses exactly once including unactivated licenses", () => {
    const groups = [[1, 3, "teste", 60], [2, 1, "teste", 2880], [3, 51, "teste", 4320],
      [7, 10, "premium", null], [30, 6, "premium", null], [180, 10, "premium", null], [365, 1, "premium", null]] as const;
    const rows = groups.flatMap(([days, count, tipo, minutes]) => Array.from({ length: count }, () => ({
      duracao_dias: days, tipo, trial_duracao_minutos: minutes, expira_em: null,
    })));
    const before = JSON.stringify(rows);
    const counts = countDurationBuckets(rows);
    expect(counts).toEqual({ todos: 82, teste: 3, "1d": 0, "2d": 1, "3d": 51, "7d": 10,
      "15d": 0, "30d": 6, "60d": 0, "90d": 0, "180d": 10, "1ano": 1, outros: 0 });
    expect(LICENSE_DURATIONS.reduce((sum, entry) => sum + counts[entry.id], 0)).toBe(82);
    expect(JSON.stringify(rows)).toBe(before);
  });
  it("keeps custom durations counted once without labelling them lifetime", () => {
    const counts = countDurationBuckets([{ tipo: "premium", duracao_dias: 12, trial_duracao_minutos: null }]);
    expect(counts.outros).toBe(1);
    expect(counts.todos).toBe(1);
  });
});