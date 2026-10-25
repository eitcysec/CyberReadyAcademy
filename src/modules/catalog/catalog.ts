/**
 * Public training catalog — placeholder content.
 *
 * Static data for CRA-001. No course here is bookable yet; every entry is
 * marked "planned" so the site never implies a service is operational.
 * Persistence and management of the catalog arrive in a later task
 * (see docs/roadmap.md).
 */
export type CourseStatus = "planned";
export type DeliveryMode = "in-person" | "virtual";

export interface Course {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly audience: string;
  readonly delivery: readonly DeliveryMode[];
  readonly status: CourseStatus;
}

export const catalog: readonly Course[] = [
  {
    slug: "phishing-and-scams",
    title: "Recognising phishing and scams",
    summary:
      "Spot fake emails, SMS and WhatsApp messages, including mobile-money and impersonation scams.",
    audience: "All staff",
    delivery: ["in-person", "virtual"],
    status: "planned",
  },
  {
    slug: "passwords-and-accounts",
    title: "Protecting passwords and accounts",
    summary:
      "Build strong passphrases, use two-step verification and keep shared devices from exposing accounts.",
    audience: "All staff",
    delivery: ["in-person", "virtual"],
    status: "planned",
  },
  {
    slug: "safe-devices-and-data",
    title: "Keeping devices and data safe",
    summary:
      "Handle phones, laptops, USB drives and customer records safely at work and on the move.",
    audience: "Staff who handle customer or financial data",
    delivery: ["in-person"],
    status: "planned",
  },
  {
    slug: "leading-a-secure-team",
    title: "Leading a security-aware team",
    summary:
      "Set simple security habits, respond to incidents calmly and know when to bring in outside help.",
    audience: "Managers and business owners",
    delivery: ["in-person", "virtual"],
    status: "planned",
  },
];

const deliveryLabels: Record<DeliveryMode, string> = {
  "in-person": "In person",
  virtual: "Virtual",
};

export function formatDelivery(modes: readonly DeliveryMode[]): string {
  return modes.map((mode) => deliveryLabels[mode]).join(" or ");
}
