import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { catalog } from "@/modules/catalog/catalog";
import ContactPage from "./contact/page";
import HomePage from "./page";

describe("landing page", () => {
  it("has exactly one top-level heading", () => {
    render(<HomePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/cybersecurity/i);
  });

  it("offers a clearly labelled inquiry entry point", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "Make an inquiry" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("lists every planned course, each marked as not yet bookable", () => {
    render(<HomePage />);
    const list = screen.getByRole("list", { name: "Planned courses" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(catalog.length);
    for (const item of items) {
      expect(item).toHaveTextContent("Planned, not yet bookable");
    }
  });

  it("does not claim that unimplemented services are operational", () => {
    const { container } = render(<HomePage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/not yet open for booking/i);
    expect(text).not.toMatch(/book now|enrol now|sign up now|available now/i);
  });
});

describe("inquiry placeholder page", () => {
  it("states that inquiries are not open and offers no form to submit", () => {
    const { container } = render(<ContactPage />);
    expect(screen.getByText(/online inquiries are not open yet/i)).toBeInTheDocument();
    expect(container.querySelector("form, input, textarea")).toBeNull();
  });
});
