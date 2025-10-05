-- Create users table (simplified - just fullname for now)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table for ISC2 CC exam prep
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  domain VARCHAR(255), -- ISC2 CC domains like Security Principles, Business Continuity, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test_results table to track student performance
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test_answers table to store individual answers for review
CREATE TABLE IF NOT EXISTS test_answers (
  id SERIAL PRIMARY KEY,
  test_result_id INTEGER REFERENCES test_results(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  user_answer CHAR(1) CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_test_result_id ON test_answers(test_result_id);
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
