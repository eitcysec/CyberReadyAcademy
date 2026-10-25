import { describe, expect, it } from "vitest";
import { catalog, formatDelivery } from "./catalog";

describe("catalog", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = catalog.map((course) => course.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("marks every course as planned while booking is not implemented", () => {
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog.every((course) => course.status === "planned")).toBe(true);
  });

  it("formats delivery modes for display", () => {
    expect(formatDelivery(["in-person", "virtual"])).toBe("In person or Virtual");
    expect(formatDelivery(["virtual"])).toBe("Virtual");
  });
});
