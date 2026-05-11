import express from "express";
import cors from "cors";
import CookieParser from "cookie-parser";

const app = express();

// Support comma-separated CORS origins via env `CORS_ORIGIN`
const rawOrigins = process.env.CORS_ORIGIN || '';
const envOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
// Add commonly used local dev hosts for frontend
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests like curl/postman which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
  },
  credentials: true,
}));

app.use( express.json({
    limit: "16kb",
  })
);

app.use( express.urlencoded({
    limit: "16kb",
    extended: true,
  })
);

app.use(CookieParser());

export default app;