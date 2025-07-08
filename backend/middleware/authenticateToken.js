const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    if (!user.email || !user.id) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
