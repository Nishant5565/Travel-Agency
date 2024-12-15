const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { PORT, MONGODBURL } = process.env;
const app = express();
const User = require('./models/index').User;
const authenticateToken = require('./middleware/auth');

//* Middleware
app.use(cors(
  {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
));
app.use(bodyParser.json());


//* Auth jwt checker and user data

app.post('/check-auth', authenticateToken,async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
});

//* MongoDB Connection
mongoose.connect(MONGODBURL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(MONGODBURL, 'MongoDB connection error:', err));

app.get('/api-docs', (req, res) => {
  res.send(`
    <h1>API Documentation</h1>
    <ul>
      <li>POST /signup</li>
      <li>POST /login</li>
      <li>GET /protected</li>
      <li>GET /packages</li>
      <li>GET /packages/:id</li>
      <li>POST /bookings</li>
      <li>POST /packages</li>
      <li>PUT /packages/:id</li>
      <li>DELETE /packages/:id</li>
      <li>GET /bookings</li>
    </ul>
  `);
});
app.use('/api',require('./routes'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});