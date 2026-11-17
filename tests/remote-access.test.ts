import { describe, expect, it } from "vitest";
import { remoteAccessEnabled, REMOTE_ACCESS_PRESET, REMOTE_ACCESS_PRODUCT } from "../src/lib/remote-access";

describe("Remote Access additions", () => {
  it("is off without a per-license choice", () => {
    expect(remoteAccessEnabled(null)).toBe(false);
  });
  it("returns the saved switch value", () => {
    expect(remoteAccessEnabled({ ativo: true })).toBe(true);
    expect(remoteAccessEnabled({ ativo: false })).toBe(false);
  });
  it("uses the requested product identifier", () => {
    expect(REMOTE_ACCESS_PRODUCT).toBe("mr-acesso-remoto");
  });
  it("adds 15 days as premium, not trial", () => {
    expect(REMOTE_ACCESS_PRESET.kind).toBe("premium");
    expect(REMOTE_ACCESS_PRESET.dias).toBe(15);
  });
});