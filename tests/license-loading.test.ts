import { afterEach, describe, expect, it, vi } from "vitest";
import { loadWithLicenseSession } from "../src/lib/license-loading";

afterEach(() => vi.useRealTimers());

describe("license loading", () => {
  it("never reads licenses without a session", async () => {
    const read = vi.fn();
    expect(await loadWithLicenseSession(async () => ({ data: { session: null } }), read)).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });

  it("loads more than 50 licenses after session restoration", async () => {
    const rows = Array.from({ length: 72 }, (_, id) => ({ id }));
    const read = vi.fn(async () => rows);
    expect(await loadWithLicenseSession(async () => ({ data: { session: { user: {} } } }), read)).toHaveLength(72);
    expect(read).toHaveBeenCalledOnce();
  });

  it("ends loading after 15 seconds even if session restoration hangs", async () => {
    vi.useFakeTimers();
    const read = vi.fn();
    const result = loadWithLicenseSession(() => new Promise(() => {}), read);
    const assertion = expect(result).rejects.toThrow("Tempo esgotado ao carregar licenças");
    await vi.advanceTimersByTimeAsync(15_000);
    await assertion;
    expect(read).not.toHaveBeenCalled();
  });

  it("also bounds a hung license query to 15 seconds", async () => {
    vi.useFakeTimers();
    const result = loadWithLicenseSession(async () => ({ data: { session: {} } }), () => new Promise(() => {}));
    const assertion = expect(result).rejects.toThrow("Tempo esgotado ao carregar licenças");
    await vi.advanceTimersByTimeAsync(15_000);
    await assertion;
  });
});