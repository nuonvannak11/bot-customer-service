import multer from "multer";
import { LIMIT_FILE_SIZE } from "../constants";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_FILE_SIZE },
});
