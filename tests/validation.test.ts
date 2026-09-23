import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  passwordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";
import {
  adminUpdateUserSchema,
  updateProfileSchema,
  userIdSchema,
} from "@/lib/validation/profile";

describe("email normalisation", () => {
  it("trims and lowercases emails in sign-in", () => {
    const result = signInSchema.parse({ email: "  Alice@Example.COM ", password: "secret" });
    expect(result.email).toBe("alice@example.com");
  });

  it("rejects malformed emails", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });
});

describe("password policy", () => {
  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("Passw0rd!").success).toBe(true);
  });

  it("requires at least 8 characters", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("requires a letter", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });

  it("requires a number", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts valid input and trims the name", () => {
    const result = signUpSchema.parse({
      fullName: "  Ada Lovelace  ",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    expect(result.fullName).toBe("Ada Lovelace");
  });

  it("rejects a too-short name", () => {
    const result = signUpSchema.safeParse({
      fullName: "A",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("passes when passwords match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
    });
    expect(result.success).toBe(true);
  });

  it("fails when passwords differ, pointing at confirmPassword", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Passw0rd!",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("normalises the email", () => {
    expect(forgotPasswordSchema.parse({ email: "BOB@X.io" }).email).toBe("bob@x.io");
  });
});

describe("updateProfileSchema", () => {
  it("normalises empty optional fields to null", () => {
    const result = updateProfileSchema.parse({
      fullName: "Chris Client",
      company: "",
      phone: "",
      avatarUrl: "",
    });
    expect(result.company).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.avatarUrl).toBeNull();
  });

  it("rejects a non-http avatar URL", () => {
    const result = updateProfileSchema.safeParse({
      fullName: "Chris Client",
      avatarUrl: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid phone number", () => {
    const result = updateProfileSchema.safeParse({
      fullName: "Chris Client",
      phone: "+1 (555) 010-2030",
    });
    expect(result.success).toBe(true);
  });
});

describe("adminUpdateUserSchema", () => {
  it("includes email and role", () => {
    const result = adminUpdateUserSchema.parse({
      fullName: "Ada Admin",
      email: "Admin@Example.com",
      role: "admin",
    });
    expect(result.email).toBe("admin@example.com");
    expect(result.role).toBe("admin");
  });

  it("rejects an unknown role", () => {
    const result = adminUpdateUserSchema.safeParse({
      fullName: "Ada Admin",
      email: "admin@example.com",
      role: "superuser",
    });
    expect(result.success).toBe(false);
  });
});

describe("userIdSchema", () => {
  it("accepts UUIDs and rejects arbitrary strings", () => {
    expect(userIdSchema.safeParse("3f2504e0-4f89-11d3-9a0c-0305e82c3301").success).toBe(true);
    expect(userIdSchema.safeParse("abc").success).toBe(false);
  });
});
