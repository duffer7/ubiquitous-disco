import { describe, expect, it } from "vitest";

import {
  buildQueryString,
  cn,
  formatDate,
  formatRelative,
  humanizeAction,
  initials,
  parsePage,
} from "@/lib/utils";
import { pageItems } from "@/components/ui/pagination";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false, undefined, "b", null, "c")).toBe("a b c");
  });

  it("returns an empty string when nothing is passed", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("returns an em-dash for empty input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns an em-dash for invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats a valid ISO timestamp", () => {
    expect(formatDate("2024-01-15T10:30:00Z")).not.toBe("—");
  });
});

describe("initials", () => {
  it("uses first letters of a two-word name", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
  });

  it("falls back to the email local part", () => {
    expect(initials(null, "chris@example.com")).toBe("CH");
  });

  it("handles a single-word name", () => {
    expect(initials("Prince")).toBe("PR");
  });
});

describe("humanizeAction", () => {
  it("turns a dotted action into a readable label", () => {
    expect(humanizeAction("auth.signed_in")).toBe("Signed in");
    expect(humanizeAction("account.created")).toBe("Created");
  });
});

describe("buildQueryString", () => {
  it("drops empty values and encodes the rest", () => {
    const qs = buildQueryString({ page: 2, search: "ada", role: undefined, sort: "" });
    expect(qs).toBe("?page=2&search=ada");
  });

  it("returns an empty string when there is nothing to encode", () => {
    expect(buildQueryString({ a: undefined, b: null })).toBe("");
  });
});

describe("parsePage", () => {
  it("defaults to 1 for missing or invalid input", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });

  it("clamps within the allowed range", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-5")).toBe(1);
    expect(parsePage("999999", 1, 100)).toBe(100);
    expect(parsePage("3")).toBe(3);
  });
});

describe("formatRelative", () => {
  it("returns an em-dash for empty input", () => {
    expect(formatRelative(null)).toBe("—");
  });

  it("describes a past date in relative terms", () => {
    const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
    expect(formatRelative(twoDaysAgo)).toMatch(/ago/);
  });
});

describe("pageItems", () => {
  it("returns a single page when there is only one", () => {
    expect(pageItems(1, 1)).toEqual([1]);
  });

  it("inserts ellipses for large page ranges", () => {
    const items = pageItems(5, 20);
    expect(items[0]).toBe(1);
    expect(items).toContain(null);
    expect(items[items.length - 1]).toBe(20);
  });
});
