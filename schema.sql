CREATE DATABASE IF NOT EXISTS abuse_reports_db;

USE abuse_reports_db;

CREATE TABLE IF NOT EXISTS abuse_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_ip VARCHAR(45) NOT NULL,
    email_id VARCHAR(255) NOT NULL UNIQUE,
    thread_ts VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_server_ip (server_ip)
);
