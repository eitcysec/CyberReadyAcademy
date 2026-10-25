import type { Metadata } from "next";
import Link from "next/link";
import { CourseList } from "../CourseList";
import styles from "../public.module.css";

export const metadata: Metadata = { title: "Planned courses" };

export default function ServicesPage() {
  return (
    <section className={`wrap ${styles.hero}`} aria-labelledby="services-title">
      <h1 id="services-title" className={styles.heroTitle}>
        Planned courses
      </h1>
      <p className={styles.lead}>
        This catalog is a preview. None of these courses can be booked yet, and titles, content and
        formats may change before launch.
      </p>
      <p className={styles.statusNote}>
        Interested in training for your organisation? <Link href="/contact">Make an inquiry</Link>.
      </p>
      <CourseList headingLevel={2} />
    </section>
  );
}
