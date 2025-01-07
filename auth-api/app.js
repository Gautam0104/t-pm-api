const express = require('express');
const session = require('express-session');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/userData');


const app = express();
app.use(express.json());

// Session configuration
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 15 * 60 * 1000 }, // 15 minutes session
    })
);
const cors = require('cors');
app.use(cors());
// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', sessionMiddleware, dashboardRoutes);
app.use('/', userRoutes)

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});