import { catalog, formatDelivery } from "@/modules/catalog/catalog";
import styles from "./public.module.css";

const statusLabel = { planned: "Planned, not yet bookable" } as const;

export function CourseList({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className={styles.courseList} aria-label="Planned courses">
      {catalog.map((course) => (
        <li key={course.slug} className={styles.course}>
          <div>
            <Heading className={styles.courseTitle}>{course.title}</Heading>
            <p className={styles.courseSummary}>{course.summary}</p>
          </div>
          <dl className={styles.courseMeta}>
            <dt>For</dt>
            <dd>{course.audience}</dd>
            <dt>Format</dt>
            <dd>{formatDelivery(course.delivery)}</dd>
            <dt>Status</dt>
            <dd>
              <span className={styles.badge}>{statusLabel[course.status]}</span>
            </dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
