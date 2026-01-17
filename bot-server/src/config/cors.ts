import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://yourdomain.com",
  "https://another-frontend.com"
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});
