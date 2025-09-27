require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

// API Routes
app.use('/api/generateCode', require('./api/generateCode'));
app.use('/api/markAttendance', require('./api/markAttendance'));
app.use('/api/download', require('./api/download'));
app.use('/api/attendancePreview', require('./api/attendancePreview'));

// Serve combined HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ⚠️ Remove this completely!
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
