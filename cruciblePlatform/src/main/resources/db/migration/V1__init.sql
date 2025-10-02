-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashedPassword VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL
);

CREATE TABLE contests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    markdownDescription TEXT,
    creatorId BIGINT REFERENCES users(id) ON DELETE SET NULL,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, hashedPassword, roles) VALUES
('user1', 'user1@example.com', '$2a$10$5Bjuh4BwIg3Xug/OHMy2EezXfVEM0H1MPlqd0vClOx72nViUUQPci', ARRAY['USER']); -- password is 'password123';

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    markdownDescription TEXT,
    creatorId BIGINT REFERENCES users(id) ON DELETE SET NULL,
    points INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    userId BIGINT REFERENCES users(id) ON DELETE CASCADE,
    questionId BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    output TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_cases (
    id BIGSERIAL PRIMARY KEY,
    questionId BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expectedOutput TEXT NOT NULL,
    isSample BOOLEAN NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- join tables 

-- user_contests
CREATE TABLE user_contests (
    userId BIGINT REFERENCES users(id),
    contestId BIGINT REFERENCES contests(id),
    PRIMARY KEY (userId, contestId),

    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solvedQuestions INT DEFAULT 0,
    totalSubmissions INT DEFAULT 0,
    totalPoints INT DEFAULT 0,
    lastSubmissionAt TIMESTAMP,
    rank INT DEFAULT NULL
);

-- contest_questions
CREATE TABLE contest_questions (
    contestId BIGINT REFERENCES contests(id),
    questionId BIGINT REFERENCES questions(id),
    PRIMARY KEY (contestId, questionId)
);

-- contest_admins
CREATE TABLE contest_admins (
    contestId BIGINT REFERENCES contests(id),
    adminId BIGINT REFERENCES users(id),
    PRIMARY KEY (contestId, adminId)
);

-- Add indexes for better query performance
CREATE INDEX idx_questions_creatorId ON questions(creatorId);
CREATE INDEX idx_submissions_userId ON submissions(userId);
CREATE INDEX idx_submissions_questionId ON submissions(questionId);
CREATE INDEX idx_test_cases_questionId ON test_cases(questionId);
CREATE INDEX idx_contests_creatorId ON contests(creatorId);
CREATE INDEX idx_user_contests_userId ON user_contests(userId);
CREATE INDEX idx_user_contests_contestId ON user_contests(contestId);
CREATE INDEX idx_contest_questions_contestId ON contest_questions(contestId);
CREATE INDEX idx_contest_questions_questionId ON contest_questions(questionId);
CREATE INDEX idx_contest_admins_contestId ON contest_admins(contestId);
CREATE INDEX idx_contest_admins_adminId ON contest_admins(adminId);