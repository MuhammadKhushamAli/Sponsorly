import jwt from "jsonwebtoken";

// Access Token
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1d" }
  );
};

// Refresh Token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};