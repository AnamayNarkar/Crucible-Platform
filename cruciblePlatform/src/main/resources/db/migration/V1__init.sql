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

INSERT INTO users (username, email, hashed_password, roles) VALUES
('user1', 'user1@example.com', '$2a$10$5Bjuh4BwIg3Xug/OHMy2EezXfVEM0H1MPlqd0vClOx72nViUUQPci', ARRAY['USER']); -- password is 'password123';

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    markdown_description TEXT,
    creator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
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

-- contest_questions
CREATE TABLE contest_questions (
    contest_id BIGINT REFERENCES contests(id),
    question_id BIGINT REFERENCES questions(id),
    PRIMARY KEY (contest_id, question_id)
);

-- contest_admins
CREATE TABLE contest_admins (
    contest_id BIGINT REFERENCES contests(id),
    admin_id BIGINT REFERENCES users(id),
    PRIMARY KEY (contest_id, admin_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_questions_creator_id ON questions(creator_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_question_id ON submissions(question_id);
CREATE INDEX idx_test_cases_question_id ON test_cases(question_id);
CREATE INDEX idx_contests_creator_id ON contests(creator_id);
CREATE INDEX idx_user_contests_user_id ON user_contests(user_id);
CREATE INDEX idx_user_contests_contest_id ON user_contests(contest_id);
CREATE INDEX idx_contest_questions_contest_id ON contest_questions(contest_id);
CREATE INDEX idx_contest_questions_question_id ON contest_questions(question_id);
CREATE INDEX idx_contest_admins_contest_id ON contest_admins(contest_id);
CREATE INDEX idx_contest_admins_admin_id ON contest_admins(admin_id);

-- classify as a postgresql migration

DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL migration loaded.';
END
$$;
