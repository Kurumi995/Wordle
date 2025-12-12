import jwt from 'jsonwebtoken';
import fs from 'fs'

let jwtSecretKey, jwtPublicKey;

const loadKeys = () => {
  const privPath = process.env.JWT_PRIVATE_KEY_PATH;
  const pubPath  = process.env.JWT_PUBLIC_KEY_PATH;

  jwtSecretKey = privPath ? fs.readFileSync(privPath, 'utf8') : process.env.JWT_PRIVATE_KEY;
  jwtPublicKey  = pubPath  ? fs.readFileSync(pubPath, 'utf8')  : process.env.JWT_PUBLIC_KEY;
}

const validateJWT = (req, res, next) => {
  loadKeys();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const payload = jwt.verify(token, jwtPublicKey, { algorithms: ['RS256']});
    if (payload?.userId) {
      req.userId = payload.userId;
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.sendStatus(403);
  }
}

export { validateJWT };