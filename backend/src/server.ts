import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes";

const app = express();
const port = get_env("PORT", "3100");

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB();
middlewares(app);
setUpRoutes(app);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
