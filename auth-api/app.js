const express = require('express');
const session = require('express-session');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/userData');
const projectRoutes = require('./routes/projectData');
const createProject = require('./routes/createProject');
const singleProjectRoutes = require('./routes/singleProject');


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

// simple hello world massege
app.get('/',(req,res)=>{
    res.json({
            message:"Hello World!"
    });
})

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', sessionMiddleware, dashboardRoutes);
app.use('/', userRoutes);
app.use('/', projectRoutes);
app.use('/', createProject);
app.use('/', singleProjectRoutes);



// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
