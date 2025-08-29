# University Application Tracker — Database Schema
**Database:** PostgreSQL 15+ (Supabase compatible)  
**Author:** Yuchen Yin (TriVector AI)  
**Last Updated:** 2025-08-29 (Australia/Sydney)

---

## 1. Purpose & Scope
This document is the authoritative specification for the relational schema powering the **University Application Tracker**. It defines entity models, relationships, constraints, indexing strategy, row‑level security (RLS) posture, and migration order. It is written to be implementation‑ready and easy to maintain.

---

## 2. Design Overview

### 2.1 Core Concepts
- **Users** log in via Supabase Auth (`auth.users`). A user is either a **student** or a **parent**.
- **Universities** publish deadlines and requirements.
- **Applications** connect **students ↔ universities** and track lifecycle & dates.
- **Requirements** are defined at the university level; **progress** is tracked per application.
- **Parents** can be linked to multiple students and can add notes on applications.

### 2.2 Entity Relationship Diagram (ERD)
```
auth.users
    │ (1:1, PK=auth.users.id)
    ▼
profiles (user_id PK, role)
    ├── student_profile (1:1)
    ├── parent_links (M:N: parent_user_id ↔ student_user_id)
    ├── applications (1:M)
    │       └── application_requirement_progress (for each requirement in university_requirements)
    ├── parent_notes (1:M)
universities (1:M)
    └── university_requirements (1:M)
```

---

## 3. Enumerations
Use DB‑level enums to guarantee valid states and reduce application‑side validation.

```sql
-- roles
CREATE TYPE role_type AS ENUM ('student','parent');

-- application lifecycle
CREATE TYPE application_status AS ENUM (
  'NOT_STARTED','IN_PROGRESS','SUBMITTED','UNDER_REVIEW','ACCEPTED','WAITLISTED','REJECTED'
);

-- application intake type
CREATE TYPE application_type AS ENUM ('Early_Decision','Early_Action','Regular_Decision','Rolling_Admission');

-- per‑requirement progress
CREATE TYPE requirement_status AS ENUM ('not_started','in_progress','completed');
```

---

## 4. Tables (DDL)

> **Ordering note:** Create in the sequence shown to satisfy FK dependencies.

### 4.1 `profiles`
Every authenticated user has exactly one profile row.

```sql
CREATE TABLE IF NOT EXISTS profiles (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         role_type NOT NULL,
  first_name   VARCHAR(255),
  last_name    VARCHAR(255),
  email        VARCHAR(255) UNIQUE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE profiles IS 'Application-facing identity attached to auth.users.';
COMMENT ON COLUMN profiles.role IS 'student | parent';
```

### 4.2 `student_profile`
Only present for users whose role = student.

```sql
CREATE TABLE IF NOT EXISTS student_profile (
  user_id           UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  graduation_year   INTEGER CHECK (graduation_year BETWEEN 1900 AND 2100),
  gpa               DECIMAL(3,2) CHECK (gpa BETWEEN 0.00 AND 5.00),
  sat_score         INTEGER CHECK (sat_score BETWEEN 200 AND 1600),
  act_score         INTEGER CHECK (act_score BETWEEN 1 AND 36),
  target_countries  TEXT[],
  intended_majors   TEXT[]
);
```

### 4.3 `parent_links`
Many‑to‑many association of parents ↔ students.

```sql
CREATE TABLE IF NOT EXISTS parent_links (
  parent_user_id  UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (parent_user_id, student_user_id),
  CHECK (parent_user_id <> student_user_id)
);
COMMENT ON TABLE parent_links IS 'Associates a parent with one or more students.';
```

### 4.4 `universities`
Canonical university catalog.

```sql
CREATE TABLE IF NOT EXISTS universities (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(255) NOT NULL,
  country            VARCHAR(100),
  state              VARCHAR(100),
  city               VARCHAR(100),
  us_news_ranking    INTEGER CHECK (us_news_ranking IS NULL OR us_news_ranking >= 1),
  acceptance_rate    DECIMAL(5,2) CHECK (acceptance_rate BETWEEN 0 AND 100),
  application_system VARCHAR(100), -- e.g. Common App / Coalition / Direct
  tuition_in_state   DECIMAL(10,2) CHECK (tuition_in_state >= 0),
  tuition_out_state  DECIMAL(10,2) CHECK (tuition_out_state >= 0),
  application_fee    DECIMAL(6,2)  CHECK (application_fee >= 0),
  deadlines          JSONB         -- e.g. {"early_decision":"2025-11-01","regular":"2026-01-01"}
);
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities (lower(name));
```

### 4.5 `applications`
One row per student ↔ university application.

```sql
CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  university_id   UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  application_type application_type,
  deadline        DATE,
  status          application_status DEFAULT 'NOT_STARTED',
  submitted_date  DATE,
  decision_date   DATE,
  decision_type   VARCHAR(50), -- 'accepted' | 'rejected' | 'waitlisted' (optional free text)
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_dates_consistency CHECK (
    (submitted_date IS NULL OR deadline IS NULL OR submitted_date >= deadline)
    AND (decision_date IS NULL OR submitted_date IS NULL OR decision_date >= submitted_date)
  )
);

-- Recommended uniqueness to avoid duplicate applications per type
CREATE UNIQUE INDEX IF NOT EXISTS uq_applications_student_univ_type
  ON applications (student_id, university_id, application_type);
CREATE INDEX IF NOT EXISTS idx_applications_student_status ON applications (student_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON applications (deadline);
```

### 4.6 `university_requirements`
Requirement catalog per university.

```sql
CREATE TABLE IF NOT EXISTS university_requirements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id     UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  requirement_type  VARCHAR(100) NOT NULL,  -- essay | recommendation | transcript | sat | act | ...
  requirement_name  VARCHAR(255) NOT NULL,  -- e.g. "Personal Statement"
  is_required       BOOLEAN NOT NULL DEFAULT TRUE,
  description       TEXT,
  order_index       INTEGER NOT NULL DEFAULT 0 CHECK (order_index >= 0),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_university_requirements_university ON university_requirements (university_id);
```

### 4.7 `application_requirement_progress`
Per‑application tracking of each requirement’s status.

```sql
CREATE TABLE IF NOT EXISTS application_requirement_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES university_requirements(id),
  status         requirement_status NOT NULL DEFAULT 'not_started',
  completed_at   TIMESTAMP WITH TIME ZONE,
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Ensure each application tracks each requirement at most once
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_req ON application_requirement_progress (application_id, requirement_id);
CREATE INDEX IF NOT EXISTS idx_app_req_application ON application_requirement_progress (application_id);
```

### 4.8 `parent_notes`
Parent-authored notes against an application.

```sql
CREATE TABLE IF NOT EXISTS parent_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  parent_user_id  UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  note            TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parent_notes_app_created ON parent_notes (application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_links (parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_links (student_user_id);
```

> **Fix applied:** The earlier draft referenced a non‑existent table `application_requirements` for indexing. It has been corrected to `application_requirement_progress`.

---

## 5. Data Integrity & Constraints
- **Cascading deletes** on foreign keys prevent orphaned data when users/universities are removed.
- **CHECK constraints** validate score ranges and chronological order of dates.
- **Unique composite** on `(student_id, university_id, application_type)` prevents duplicate application entries.
- **Progress uniqueness** on `(application_id, requirement_id)` ensures one progress row per requirement per application.

---

## 6. Indexing Strategy
- **Lookups & dashboards:**  
  - `idx_universities_name` for case‑insensitive search.  
  - `idx_applications_student_status` to compute per‑status counts fast.  
  - `idx_applications_deadline` for upcoming deadline sort/filters.  
  - `idx_parent_notes_app_created` for timeline views.  
  - `idx_app_req_application` for checklist rendering.
- **Uniqueness guarantees:** `uq_applications_student_univ_type`, `uq_app_req`.

---

## 7. Row‑Level Security (RLS) Policy Templates (Supabase)
> Enable RLS on every table. Below are safe defaults. Adjust roles as your auth model evolves.

```sql
-- Example: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_self ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Students may update their own profile
CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- student_profile
ALTER TABLE student_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_profile_self_select ON student_profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY student_profile_self_update ON student_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- applications (students see their own, parents see linked students)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY apps_student_select ON applications
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY apps_student_update ON applications
  FOR UPDATE USING (auth.uid() = student_id);

-- Allow parents read via parent_links
CREATE POLICY apps_parent_select ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_links pl
      WHERE pl.parent_user_id = auth.uid()
        AND pl.student_user_id = applications.student_id
    )
  );

-- application_requirement_progress
ALTER TABLE application_requirement_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY arp_student_rw ON application_requirement_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.student_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.student_id = auth.uid())
  );

-- parent_notes: parents can write notes for linked students; students can read
ALTER TABLE parent_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY pn_parent_write ON parent_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN parent_links pl ON pl.student_user_id = a.student_id
      WHERE a.id = application_id AND pl.parent_user_id = auth.uid()
    )
  );
CREATE POLICY pn_parent_select ON parent_notes
  FOR SELECT USING (
    -- parent can read their own notes and those linked
    EXISTS (
      SELECT 1 FROM applications a
      JOIN parent_links pl ON pl.student_user_id = a.student_id
      WHERE a.id = application_id AND pl.parent_user_id = auth.uid()
    )
    OR
    -- student sees notes on their applications
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_id AND a.student_id = auth.uid()
    )
  );
```

> **Tip:** Create a separate `admin` Postgres role with `BYPASSRLS` for back‑office tasks.

---

## 8. Migration Order
1. **Enums:** `role_type`, `application_status`, `application_type`, `requirement_status`  
2. **Tables:** `profiles` → `student_profile` → `parent_links` → `universities` → `applications` → `university_requirements` → `application_requirement_progress` → `parent_notes`  
3. **Indexes & Constraints** (uniques, secondary indexes)  
4. **RLS enablement & policies**  
5. **Seed data**

---

## 9. Seed Data (examples)

```sql
-- sample universities
INSERT INTO universities (name, country, state, city, acceptance_rate, application_system, application_fee, deadlines)
VALUES
  ('Example University A','USA','CA','Los Angeles', 12.50,'Common App', 75.00, '{"early_decision":"2025-11-01","regular":"2026-01-05"}'),
  ('Example University B','USA','MA','Boston', 18.20,'Coalition', 70.00, '{"early_action":"2025-11-15","regular":"2026-01-10"}');

-- requirements for University A
INSERT INTO university_requirements (university_id, requirement_type, requirement_name, is_required, order_index)
SELECT id, 'essay', 'Personal Statement', TRUE, 0 FROM universities WHERE name='Example University A';
INSERT INTO university_requirements (university_id, requirement_type, requirement_name, is_required, order_index)
SELECT id, 'recommendation', 'Teacher Recommendation', TRUE, 1 FROM universities WHERE name='Example University A';

-- create a student and application
-- assume auth.users contains a UUID '00000000-0000-0000-0000-000000000001' for demo
INSERT INTO profiles (user_id, role, first_name, last_name, email)
VALUES ('00000000-0000-0000-0000-000000000001','student','Ada','Lovelace','ada@example.com')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO applications (student_id, university_id, application_type, deadline, status)
SELECT '00000000-0000-0000-0000-000000000001', u.id, 'Regular_Decision', DATE (u.deadlines->>'regular'), 'IN_PROGRESS'
FROM universities u WHERE u.name='Example University A';

-- initialize requirement progress for the application
INSERT INTO application_requirement_progress (application_id, requirement_id)
SELECT a.id, r.id
FROM applications a
JOIN university_requirements r ON r.university_id = a.university_id
WHERE a.student_id = '00000000-0000-0000-0000-000000000001';
```

---

## 10. Operational Queries

**Student dashboard counts:**
```sql
SELECT status, COUNT(*) AS count
FROM applications
WHERE student_id = :student_id
GROUP BY status;
```

**Upcoming deadlines for a student (next 60 days):**
```sql
SELECT a.id, u.name AS university, a.application_type, a.deadline
FROM applications a
JOIN universities u ON u.id = a.university_id
WHERE a.student_id = :student_id
  AND a.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
ORDER BY a.deadline;
```

**Checklist for one application:**
```sql
SELECT r.requirement_name, r.requirement_type, p.status, p.completed_at
FROM university_requirements r
JOIN application_requirement_progress p ON p.requirement_id = r.id
WHERE p.application_id = :application_id
ORDER BY r.order_index, r.requirement_name;
```

**Parent’s linked students:**
```sql
SELECT s.user_id AS student_id, s.first_name, s.last_name
FROM parent_links pl
JOIN profiles s ON s.user_id = pl.student_user_id
WHERE pl.parent_user_id = :parent_user_id;
```

---

## 11. Conventions & Notes
- **Primary keys:** UUIDs via `gen_random_uuid()` for safe client‑side generation and replication.
- **Timestamps:** Use `TIMESTAMP WITH TIME ZONE` for auditability.
- **JSONB in `universities.deadlines`:** Provides flexibility for varied deadline types without frequent migrations.
- **`order_index` in requirements:** Stable UI ordering, easy to re‑arrange.

---

## 12. Future Extensions
- **Teachers / Counselors** tables and RBAC extensions (new roles).
- **Documents** (essay uploads), stored in Supabase Storage with metadata table and signed URLs.
- **Notifications** table for deadline reminders (cron triggers + email provider).
- **Analytics** materialized views for performance (e.g., success rates per application_type).

---

## 13. Appendix — Full DDL (consolidated)
> Use this block as a one‑shot migration after installing the enums.

```sql
-- Enums omitted for brevity (see §3)

-- Tables (see §§4.1–4.8)
-- All CREATE TABLE IF NOT EXISTS blocks exactly as specified above.

-- Indexes & Uniques (see §4)
-- RLS policies (see §7)
```

---

**Changelog**
- 2025‑08‑29: Initial professional spec. Corrected index typo, added checks, RLS templates, and seed snippets.
