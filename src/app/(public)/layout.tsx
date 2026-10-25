import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./public.module.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={`wrap ${styles.headerInner}`}>
          <Link href="/" className={styles.brand}>
            CyberReady Academy
          </Link>
          <nav aria-label="Main">
            <ul className={styles.nav}>
              <li>
                <Link href="/services">Courses</Link>
              </li>
              <li>
                <Link href="/contact">Make an inquiry</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className="wrap">
          <p>CyberReady Academy, Liberia. This site is in early preparation.</p>
        </div>
      </footer>
    </>
  );
}
