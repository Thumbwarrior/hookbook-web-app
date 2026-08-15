import dotenv from "dotenv";
import { initSchema } from "./index.js";

dotenv.config();
initSchema();
console.log("Database schema initialized.");
