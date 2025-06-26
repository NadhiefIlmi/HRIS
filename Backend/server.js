require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'utils/uploads')));

connectDB();

/* ENDPOINT RESET PASSWORD */
const resetPassword = require('./routes/resetPasswordRoutes');
app.use('/', resetPassword);
/* ========================================================================================= */

/* HR ONLY ROUTES */
const hrRoutes = require('./routes/hrRoutes');
app.use('/api/hr', hrRoutes);

/* =============================================================================================================================== */

/* EMPLOYEE ONLY ROUTES */
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employee', employeeRoutes);

/* ================================================================================ */

/* ADMIN ONLY ROUTES */
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
