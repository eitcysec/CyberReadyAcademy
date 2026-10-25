import Link from "next/link";
import { CourseList } from "./CourseList";
import styles from "./public.module.css";

export default function HomePage() {
  return (
    <>
      <section className={`wrap ${styles.hero}`} aria-labelledby="hero-title">
        <h1 id="hero-title" className={styles.heroTitle}>
          Cybersecurity habits your whole team can use
        </h1>
        <p className={styles.lead}>
          CyberReady Academy is preparing practical cybersecurity awareness training for
          organisations in Liberia, delivered in person or online.
        </p>
        <p className={styles.statusNote}>
          Courses are in preparation and not yet open for booking.
        </p>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.primaryAction}>
            Make an inquiry
          </Link>
          <Link href="/services">See planned courses</Link>
        </div>
      </section>

      <section className={`wrap ${styles.section}`} aria-labelledby="courses-title">
        <h2 id="courses-title" className={styles.sectionTitle}>
          Planned courses
        </h2>
        <p className={styles.sectionIntro}>
          Short sessions built around the threats people in Liberia meet every day, from SMS scams
          to shared office computers. Details may change before launch.
        </p>
        <CourseList />
      </section>
    </>
  );
}
