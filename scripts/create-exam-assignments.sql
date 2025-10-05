-- Create exam_assignments table for instructors to assign specific exams to students
CREATE TABLE IF NOT EXISTS exam_assignments (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  exam_name VARCHAR(255) NOT NULL,
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 100,
  passing_score INTEGER NOT NULL DEFAULT 70,
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, overdue
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(instructor_id, student_id, exam_name, created_at)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_assignments_student ON exam_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_instructor ON exam_assignments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_status ON exam_assignments(status);
