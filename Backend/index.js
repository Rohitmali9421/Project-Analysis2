import express from "express";
import dotenv from "dotenv";
import cors from "cors";


import AnalyzeResume from "./Routes/ResumeAnalyze.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

//Middlerwares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check Route
app.get("/health", (req, res) => {
  res.send("OK");
});

app.use("/api/resume", AnalyzeResume);


// checkAndSendEmails()
app.listen(PORT, () => {
  console.log("Server is running on " + PORT);
});
