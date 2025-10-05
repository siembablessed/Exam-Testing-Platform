-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';

-- Create feedback table for instructor notes
CREATE TABLE IF NOT EXISTS student_feedback (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  test_result_id INTEGER REFERENCES test_results(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  needs_reassessment BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_student ON student_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_instructor ON student_feedback(instructor_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Removed hardcoded instructor account - use /setup page instead
