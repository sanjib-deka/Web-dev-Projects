import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

import cookieParser from "cookie-parser";
import sealRouter from "./routes/validate.routes.js";

dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors({
    origin:"https://signkaro-sanjib.vercel.app",
    credentials:true
}));
app.use(cookieParser())
app.use("/api",authRouter)
app.use("/api",sealRouter)

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(port, () => {
    connectDB()
    console.log(`Server is running on port ${port}`);
});
