const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(express.static('.'));


const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '0000',
    database: process.env.DB_NAME || 'tracking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};


const pool = mysql.createPool(dbConfig);


pool.getConnection()
    .then(connection => {
        console.log('✅ Подключение к MySQL успешно!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Ошибка подключения к MySQL:', err.message);
        console.log('💡 Убедитесь, что MySQL запущен и база данных создана');
        console.log('💡 Запустите: npm run init-db');
    });


app.post('/api/register', async (req, res) => {
    try {
        const { familyName, name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }
        
        if (role === 'parent' && (!familyName || !name)) {
            return res.status(400).json({
                success: false,
                message: 'Все поля обязательны для родителя'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен содержать минимум 6 символов'
            });
        }

  
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Этот email уже зарегистрирован'
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const [result] = await pool.execute(
            'INSERT INTO users (family_name, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [familyName || '', name || '', email, hashedPassword, role || 'parent']
        );

        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: result.insertId,
                familyName: familyName || '',
                name: name || '',
                email: email,
                role: role || 'parent'
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка регистрации'
        });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }


        const [users] = await pool.execute(
            'SELECT id, family_name, name, email, password, role, parent_id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        const user = users[0];


        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                familyName: user.family_name,
                name: user.name,
                email: user.email,
                role: user.role,
                parentId: user.parent_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка входа'
        });
    }
});


app.post('/api/register-child', async (req, res) => {
    try {
        const { name, parentEmail, email, password } = req.body;

        if (!name || !parentEmail || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Все поля обязательны'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен содержать минимум 6 символов'
            });
        }


        const [parents] = await pool.execute(
            'SELECT id, family_name FROM users WHERE email = ? AND role = ?',
            [parentEmail, 'parent']
        );

        if (parents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Родитель с таким email не найден'
            });
        }

        const parent = parents[0];

        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Этот email уже зарегистрирован'
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const [result] = await pool.execute(
            'INSERT INTO users (family_name, name, email, password, role, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
            [parent.family_name, name, email, hashedPassword, 'child', parent.id]
        );

        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: result.insertId,
                familyName: parent.family_name,
                name: name,
                email: email,
                role: 'child',
                parentId: parent.id
            }
        });

    } catch (error) {
        console.error('Register child error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка регистрации'
        });
    }
});


app.get('/api/check-email', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                exists: false
            });
        }

        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        res.json({
            success: true,
            exists: users.length > 0
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            exists: false
        });
    }
});


app.get('/api/family-members/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [members] = await pool.execute(
            'SELECT * FROM members WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            members: members
        });

    } catch (error) {
        console.error('Get family members error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения членов семьи'
        });
    }
});


app.post('/api/family-members', async (req, res) => {
    try {
        const { userId, name, role, avatar, points, tasks, color } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO members (user_id, name, role, avatar, points, tasks, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, role, avatar, points || 0, tasks || '0/0', color]
        );

        res.json({
            success: true,
            message: 'Член семьи добавлен',
            memberId: result.insertId
        });

    } catch (error) {
        console.error('Save family member error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сохранения члена семьи'
        });
    }
});


app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [tasks] = await pool.execute(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            tasks: tasks
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения задач'
        });
    }
});


app.post('/api/tasks', async (req, res) => {
    try {
        const { userId, name, category, assignee, period, isChecked } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO tasks (user_id, name, category, assignee, period, is_checked) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, category, assignee, period, isChecked || false]
        );

        res.json({
            success: true,
            message: 'Задача сохранена',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Save task error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сохранения задачи'
        });
    }
});

app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { isChecked } = req.body;


        if (!isChecked) {
            await pool.execute(
                'UPDATE tasks SET is_checked = ?, is_confirmed = FALSE, confirmed_by = NULL, confirmed_at = NULL WHERE id = ?',
                [isChecked, taskId]
            );
        } else {
            await pool.execute(
                'UPDATE tasks SET is_checked = ? WHERE id = ?',
                [isChecked, taskId]
            );
        }

        res.json({
            success: true,
            message: 'Задача обновлена'
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления задачи'
        });
    }
});


app.put('/api/tasks/:taskId/confirm', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { confirmedBy } = req.body;

        await pool.execute(
            'UPDATE tasks SET is_confirmed = TRUE, confirmed_by = ?, confirmed_at = NOW() WHERE id = ?',
            [confirmedBy, taskId]
        );

        res.json({
            success: true,
            message: 'Задача подтверждена'
        });

    } catch (error) {
        console.error('Confirm task error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка подтверждения задачи'
        });
    }
});


app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        await pool.execute(
            'DELETE FROM tasks WHERE id = ?',
            [taskId]
        );

        res.json({
            success: true,
            message: 'Задача удалена'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления задачи'
        });
    }
});


app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║      FamilyHub Server Started       ║
╠═══════════════════════════════════════╣
║  Port: ${PORT}                          ║
║  URL:  http://localhost:${PORT}         ║
║  API:  http://localhost:${PORT}/api     ║
╚═══════════════════════════════════════╝
    `);
});


process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});
