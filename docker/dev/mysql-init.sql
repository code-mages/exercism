-- Runs once on first `docker compose up` (empty data volume).
-- Creates the development and test databases with the charset/collation the
-- app requires, and grants the `exercism` user access to both.
CREATE DATABASE IF NOT EXISTS exercism_development CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS exercism_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON exercism_development.* TO 'exercism'@'%';
GRANT ALL PRIVILEGES ON exercism_test.* TO 'exercism'@'%';
FLUSH PRIVILEGES;
