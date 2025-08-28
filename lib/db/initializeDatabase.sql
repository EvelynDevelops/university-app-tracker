-- ============================
-- University Application Tracker - Schema
-- ============================

-- enums    
CREATE TYPE role_type AS ENUM ('student','parent');
CREATE TYPE application_status AS ENUM (
  'NOT_STARTED','IN_PROGRESS','SUBMITTED','UNDER_REVIEW',
  'ACCEPTED','WAITLISTED','REJECTED'
);
CREATE TYPE application_type AS ENUM ('Early_Decision','Early_Action','Regular_Decision','Rolling_Admission');
CREATE TYPE requirement_status AS ENUM ('not_started','in_progress','completed');

-- user profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),  
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- student profile
CREATE TABLE student_profile (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  graduation_year INTEGER,
  gpa DECIMAL(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  target_countries TEXT[],
  intended_majors TEXT[]
);

-- parent links
CREATE TABLE parent_links (
  parent_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (parent_user_id, student_user_id)
);

-- universities
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  us_news_ranking INTEGER,
  acceptance_rate DECIMAL(4,2),
  application_system VARCHAR(100), -- 'Common App','Coalition','Direct'
  tuition_in_state DECIMAL(10,2),
  tuition_out_state DECIMAL(10,2),
  application_fee DECIMAL(6,2),
  deadlines JSONB -- {early_decision: '2025-11-01', regular: '2026-01-01'}
);

-- student applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  application_type application_type,
  deadline DATE,
  status application_status DEFAULT 'NOT_STARTED',
  submitted_date DATE,
  decision_date DATE,
  decision_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- university requirements
CREATE TABLE university_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  requirement_type VARCHAR(100), -- 'essay','recommendation','transcript','sat','act'...
  requirement_name VARCHAR(255), -- 'Personal Statement', 'Letters of Recommendation'
  is_required BOOLEAN DEFAULT true,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- student application requirement progress
CREATE TABLE application_requirement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES university_requirements(id),
  status requirement_status DEFAULT 'not_started',
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- parent notes
CREATE TABLE parent_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- common indexes
CREATE INDEX idx_universities_name ON universities (lower(name));
CREATE INDEX idx_applications_student_status ON applications (student_id, status);
CREATE INDEX idx_applications_deadline ON applications (deadline);
CREATE INDEX idx_requirements_application ON application_requirements (application_id);
CREATE INDEX idx_parent_notes_app_created ON parent_notes (application_id, created_at);
CREATE INDEX idx_parent_links_parent ON parent_links (parent_user_id);
CREATE INDEX idx_parent_links_student ON parent_links (student_user_id);
