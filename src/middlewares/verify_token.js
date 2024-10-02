import jwt from "jsonwebtoken";
import { notAuth } from "./handle_errors";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return notAuth("Require Authorization", res);
  }
  const accessToken = token.split(" ")[1];
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return notAuth("Token invalid!", res);
    }
    req.user = user;
    next();
  });
};

export default verifyToken;
