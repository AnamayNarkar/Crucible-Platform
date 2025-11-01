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
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
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

-- Seed Contests (using relative dates based on CURRENT_TIMESTAMP)
-- Note: We use a subquery to robustly find the creator's ID.

-- Past Contest (ended 3 days ago, 3-hour duration)
INSERT INTO contests (name, banner_image_url, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('CodeSprint 2024',
'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
'A look back at our first major coding challenge of 2024.',
E'# CodeSprint 2024\n\nThis was a 3-hour challenge focusing on dynamic programming. Congratulations to the winners!',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '3 hours',
CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Ongoing Contest (started 1 hour ago, 24-hour duration)
INSERT INTO contests (name, banner_image_url, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('Weekend Warrior II',
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
'Live now! Solve 5 challenging problems in 24 hours.',
E'# Weekend Warrior II\n\nThe challenge is live. Submissions are open. Good luck!',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
CURRENT_TIMESTAMP - INTERVAL '1 hour',
CURRENT_TIMESTAMP + INTERVAL '23 hours');

-- Upcoming Contest (starts in 2 days, 13-hour duration)
INSERT INTO contests (name, banner_image_url, card_description, markdown_description, creator_id, start_time, end_time) VALUES
('AlgoMania 2026',
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
'Get ready for the first major challenge of 2026. Registration opens soon!',
E'# AlgoMania 2026\n\nPrepare your algorithms for a 3-hour sprint. More details to be announced.',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
CURRENT_TIMESTAMP + INTERVAL '2 days',
CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '13 hours');

-- Add Two Sum problem to ongoing contest
INSERT INTO questions (title, markdown_description, creator_id, contest_id, points, is_public) VALUES
('Two Sum',
E'# Two Sum

Given an array of integers `nums` and an integer `target`, return the **indices of the first pair** of numbers (in increasing index order) such that they add up to `target`.

You may assume that each input would have exactly one such pair according to this rule, and you may not use the same element twice.

## Input Format

- The first line contains two integers `N` and `target`, where `N` is the size of the array.
- The second line contains `N` space-separated integers representing the array `nums`.

## Output Format

Output two space-separated integers representing the **indices of the first pair (i, j)** (`i < j`) such that `nums[i] + `nums[j] == target`.

## Constraints

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists based on the rule of the first pair (in index order).

## Example

**Input**

```
4 9
2 7 11 15
```

**Output**

```
0 1
```

',
(SELECT id FROM users WHERE username = 'anamaynarkar'),
(SELECT id FROM contests WHERE name = 'Weekend Warrior II'),
100,
FALSE
);

-- Test cases for Two Sum
-- Test cases for Two Sum
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
((SELECT id FROM questions WHERE title = 'Two Sum'), E'4 9\n2 7 11 15', '0 1', TRUE),
((SELECT id FROM questions WHERE title = 'Two Sum'), E'3 6\n3 2 4', '1 2', TRUE),
((SELECT id FROM questions WHERE title = 'Two Sum'), E'5 10\n1 3 5 7 9', '1 3', FALSE),
-- FIXED: The target here was -5, which incorrectly yields '1 2'.
-- The expected output '2 4' corresponds to a target of -8.
((SELECT id FROM questions WHERE title = 'Two Sum'), E'6 -8\n-1 -2 -3 -4 -5 -6', '2 4', FALSE);

-- INSERT INTO user_contests (user_id, contest_id) VALUES
-- ((SELECT id FROM users WHERE username = 'user1'), (SELECT id FROM contests WHERE name = 'Weekend Warrior II'));

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
$$ LANGUAGE plpgsql;