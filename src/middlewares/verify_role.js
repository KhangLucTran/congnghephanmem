import { notAuth } from "./handle_errors";

export const isAdmin = (req, res, next) => {
  const { role_code } = req.user;
  if (role_code !== "R1")
    return notAuth("You do not have access. Only ADMIN has access", res);
  next();
};

export const isStaffOrAdmin = (req, res, next) => {
  const { role_code } = req.user;
  if (role_code !== "R1" && role_code !== "R2")
    return notAuth(
      "You do not have access. Only ADMIN && STAFF ROLES has access",
      res
    );
  next();
};
