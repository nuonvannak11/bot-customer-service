import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/util";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes";

const app = express();
const port = get_env("PORT", "3000");
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

middlewares(app);
setUpRoutes(app);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export app