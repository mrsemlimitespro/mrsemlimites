import { describe, it, expect } from "vitest";
import { getCorsHeaders } from "@/lib/ext-v17/auth.server";
const req = (o: string) => new Request("https://x/api", { headers: { origin: o } });
describe("ext-v17 CORS", () => {
  it("aceita ID oficial", () => {
    expect(getCorsHeaders(req("chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk"))["Access-Control-Allow-Origin"]).toBe("chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk");
  });
  it("aceita novo ID", () => {
    expect(getCorsHeaders(req("chrome-extension://liafammnfabhbhlkolccllamdlmnipno"))["Access-Control-Allow-Origin"]).toBe("chrome-extension://liafammnfabhbhlkolccllamdlmnipno");
  });
  it("recusa ID desconhecido", () => {
    expect(getCorsHeaders(req("chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"))["Access-Control-Allow-Origin"]).not.toBe("chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  });
});
