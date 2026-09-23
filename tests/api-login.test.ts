import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration-style tests for the login REST handler.
 *
 * The database and password layers are mocked so the tests exercise the
 * handler's own logic: validation, rate limiting, credential checks, and the
 * session cookie contract.
 */

const findCredentialsByEmail = vi.fn();
const verifyPassword = vi.fn();
const logActivity = vi.fn();
const createSessionToken = vi.fn();

vi.mock("@/lib/db/users", () => ({
  findCredentialsByEmail,
  logActivity,
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword,
}));

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session",
  );
  return {
    ...actual,
    createSessionToken,
  };
});

// Keep the rate limiter from interfering with unrelated assertions by giving
// each test a fresh IP.
let ipCounter = 0;
const nextIp = () => `10.0.0.${ipCounter++}`;

const profile = {
  id: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  email: "client@example.com",
  full_name: "Chris Client",
  role: "client",
};

async function callLogin(body: unknown, ip: string) {
  const { POST } = await import("@/app/api/auth/login/route");
  const request = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return POST(request);
}

beforeEach(() => {
  vi.clearAllMocks();
  createSessionToken.mockResolvedValue("signed.jwt.token");
});

describe("POST /api/auth/login", () => {
  it("rejects malformed JSON with 400", async () => {
    const response = await callLogin("{ not json", nextIp());
    expect(response.status).toBe(400);
  });

  it("rejects an invalid payload with 400 and field errors", async () => {
    const response = await callLogin({ email: "nope", password: "" }, nextIp());
    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("Invalid email or password.");
  });

  it("returns 401 for an unknown account", async () => {
    findCredentialsByEmail.mockResolvedValue(null);
    const response = await callLogin({ email: "ghost@example.com", password: "Passw0rd!" }, nextIp());
    expect(response.status).toBe(401);
  });

  it("returns 401 for a wrong password", async () => {
    findCredentialsByEmail.mockResolvedValue({ profile, passwordHash: "hash" });
    verifyPassword.mockResolvedValue(false);
    const response = await callLogin({ email: profile.email, password: "wrong" }, nextIp());
    expect(response.status).toBe(401);
  });

  it("issues a session cookie and logs activity on success", async () => {
    findCredentialsByEmail.mockResolvedValue({ profile, passwordHash: "hash" });
    verifyPassword.mockResolvedValue(true);

    const response = await callLogin({ email: profile.email, password: "Passw0rd!" }, nextIp());

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("HttpOnly");

    const json = (await response.json()) as { user: { email: string; role: string } };
    expect(json.user.email).toBe(profile.email);
    expect(json.user.role).toBe("client");
    expect(logActivity).toHaveBeenCalledWith(profile.id, "auth.signed_in");
  });

  it("rate-limits repeated attempts from the same IP", async () => {
    findCredentialsByEmail.mockResolvedValue({ profile, passwordHash: "hash" });
    verifyPassword.mockResolvedValue(false);

    const ip = nextIp();
    let lastStatus = 0;
    // The limit is 10/minute; the 11th attempt should be throttled.
    for (let i = 0; i < 11; i += 1) {
      const response = await callLogin({ email: profile.email, password: "wrong" }, ip);
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
