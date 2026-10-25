import type { Metadata } from "next";
import Link from "next/link";
import styles from "./(public)/public.module.css";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className={`wrap ${styles.hero}`}>
      <h1 className={styles.heroTitle}>Page not found</h1>
      <p className={styles.lead}>The address may be mistyped, or the page may have moved.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primaryAction}>
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
