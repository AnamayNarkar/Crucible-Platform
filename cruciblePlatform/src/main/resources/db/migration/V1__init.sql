-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL
);

CREATE TABLE contests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    banner_image_url TEXT,  
    card_description TEXT,
    markdown_description TEXT,
    creator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    markdown_description TEXT,
    creator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
    points INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    output TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_cases (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- join tables 

-- user_contests
CREATE TABLE user_contests (
    user_id BIGINT REFERENCES users(id),
    contest_id BIGINT REFERENCES contests(id),
    PRIMARY KEY (user_id, contest_id),

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solved_questions INT DEFAULT 0,
    total_submissions INT DEFAULT 0,
    total_points INT DEFAULT 0,
    last_submission_at TIMESTAMP,
    rank INT DEFAULT NULL
);

-- contest_admins
CREATE TABLE contest_admins (
    contest_id BIGINT REFERENCES contests(id),
    admin_id BIGINT REFERENCES users(id),
    PRIMARY KEY (contest_id, admin_id)
);

-- ---
-- SEED DATA
-- ---

-- Seed Users
INSERT INTO users (username, email, hashed_password, roles) VALUES
('user1', 'user1@example.com', '$2a$10$5Bjuh4BwIg3Xug/OHMy2EezXfVEM0H1MPlqd0vClOx72nViUUQPci', ARRAY['USER']); -- password is 'password123'

INSERT INTO users (username, email, hashed_password, roles) VALUES
('anamaynarkar', 'anamay.narkar.17@gmail.com', '$2a$10$WlB2GgS6WhZSEHoXKJjGF.1d6B.OyHuEB45kJ/DD9nRyUTcuXoggC', ARRAY['USER']);

-- Seed Contests (assuming current date is ~2025-10-25)
-- Note: We use a subquery to robustly find the creator's ID.

-- Past Contest
INSERT INTO contests (name, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('CodeSprint 2024',
'A look back at our first major coding challenge of 2024.',
'# CodeSprint 2024\nThis was a 3-hour challenge focusing on dynamic programming. Congratulations to the winners!',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
'2024-10-01 12:00:00',
'2024-10-01 15:00:00');

-- Ongoing Contest
INSERT INTO contests (name, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('Weekend Warrior II',
'Live now! Solve 5 challenging problems in 24 hours.',
'# Weekend Warrior II\nThe challenge is live. Submissions are open. Good luck!',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
'2025-10-25 12:00:00',
'2025-10-26 12:00:00');

-- Upcoming Contest
INSERT INTO contests (name, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('AlgoMania 2026',
'Get ready for the first major challenge of 2026. Registration opens soon!',
'# AlgoMania 2026\nPrepare your algorithms for a 3-hour sprint. More details to be announced.',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
'2026-01-15 09:00:00',
'2026-01-15 12:00:00');


-- ---
-- INDEXES
-- ---

-- Add indexes for better query performance
CREATE INDEX idx_questions_creator_id ON questions(creator_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_question_id ON submissions(question_id);
CREATE INDEX idx_test_cases_question_id ON test_cases(question_id);
CREATE INDEX idx_contests_creator_id ON contests(creator_id);
CREATE INDEX idx_user_contests_user_id ON user_contests(user_id);
CREATE INDEX idx_user_contests_contest_id ON user_contests(contest_id);
CREATE INDEX idx_contest_admins_contest_id ON contest_admins(contest_id);
CREATE INDEX idx_contest_admins_admin_id ON contest_admins(admin_id);

-- classify as a postgresql migration

DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL migration loaded.';
END
$$;