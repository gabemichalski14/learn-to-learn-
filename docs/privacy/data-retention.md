# Data Retention & Deletion Policy (COPPA §312.10)

_Learn to Learn — independent structured-literacy practice tool. Last updated 2026-06-10._

## What we collect (and what we don't)
- **Student data:** a **first name or initials only** (no last name, address, photo, or contact info), and **practice data** — which skills were attempted, correct/incorrect, timing, sessions, and earned stickers. This is the minimum needed to personalize practice and report progress.
- **We do NOT collect:** student email/phone/address, precise location, or any **biometric** identifier. The app **plays** audio; it never records the child's voice.
- **Adults (tutors/parents):** email + password (for sign-in only).

## Purpose
Children's practice data is collected solely to **deliver and personalize the educational service** and to **report progress to the child's tutor and parent**. It is never used for advertising, profiling, or sold/shared with third parties.

## Retention timeframe
- Practice data is retained **only as long as the student is active at the center** plus a short wind-down (default **12 months** of inactivity), after which it is deleted.
- When a student **leaves the center** (or a parent withdraws), their data is deleted on the next review cycle even without a specific request.
- Backups roll off within **30 days** of deletion.

## Parental & tutor rights
- **Review:** a parent can view all practice data collected for their own child.
- **Export:** a parent can download a copy of their child's report.
- **Delete:** a parent can **request deletion** in-app (clearly surfaced on the parent home). The center owner sees the request in a visible **deletion-requests inbox** and confirms the deletion (a confirm step prevents accidental, irreversible loss). Requests are honored promptly.

## How deletion works (technical)
Deleting a learner cascades to all of that learner's sessions, skill-events, achievements, and assignments (`on delete cascade`). The center authorizes data collection for educational use; parents retain access, export, and deletion rights at all times.

## Security
Per-row access is enforced in the database (Row-Level Security): a tutor can read only their **assigned** students; a parent can read only **their own child**; no one can read another center's data. Service credentials never reach the browser.
