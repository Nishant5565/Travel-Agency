const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  try {
  
    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = decoded
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
};

module.exports = authenticateToken;
