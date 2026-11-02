CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    codeforces_username VARCHAR(100),
    atcoder_username VARCHAR(100),
    codechef_username VARCHAR(100),
    leetcode_username VARCHAR(100),
    token_version BIGINT NOT NULL DEFAULT 0
);
