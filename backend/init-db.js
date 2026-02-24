const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
};

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('🔄 Подключение к MySQL...');
        

        connection = await mysql.createConnection(dbConfig);
        
        console.log('✅ Подключено к MySQL');
        
        const dbName = process.env.DB_NAME || 'tracking';
        

        console.log(`🔄 Проверка базы данных ${dbName}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ База данных ${dbName} готова`);
        

        await connection.query(`USE ${dbName}`);
        

        console.log('🔄 Создание таблицы users...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                family_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('parent', 'child') NOT NULL DEFAULT 'parent',
                name VARCHAR(255),
                parent_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_parent_id (parent_id),
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Таблица users создана');
        

        console.log('🔄 Создание таблицы family_members...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(100),
                avatar TEXT,
                points INT DEFAULT 0,
                tasks VARCHAR(50) DEFAULT '0/0',
                color VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Таблица family_members создана');
        

        console.log('🔄 Создание таблицы tasks...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                assignee VARCHAR(255),
                period VARCHAR(50),
                is_checked BOOLEAN DEFAULT FALSE,
                is_confirmed BOOLEAN DEFAULT FALSE,
                confirmed_by INT NULL,
                confirmed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_category (category),
                INDEX idx_period (period),
                INDEX idx_confirmed (is_confirmed)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


initializeDatabase();
