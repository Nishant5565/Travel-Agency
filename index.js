const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { PORT, MONGODBURL } = require('./config');

// Initialize the app
const app = express();

//* Middleware
app.use(cors());
app.use(bodyParser.json());

//* MongoDB Connection
mongoose.connect(MONGODBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

//* API Routes
app.use('/api', routes);



app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
