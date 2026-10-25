import type { Metadata } from "next";
import Link from "next/link";
import styles from "../public.module.css";

export const metadata: Metadata = { title: "Make an inquiry" };

export default function ContactPage() {
  return (
    <section className={`wrap ${styles.hero}`} aria-labelledby="contact-title">
      <h1 id="contact-title" className={styles.heroTitle}>
        Make an inquiry
      </h1>
      <p className={styles.lead}>
        You will be able to ask about training for your organisation from this page.
      </p>
      <div className={styles.panel} role="note" aria-label="Inquiry form status">
        <p>
          <strong>Online inquiries are not open yet.</strong> The inquiry form is being built and
          nothing can be submitted from this site today.
        </p>
        <p>
          In the meantime, you can <Link href="/services">read about the planned courses</Link>.
        </p>
      </div>
    </section>
  );
}
