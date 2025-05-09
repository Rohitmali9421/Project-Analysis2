import express from "express";
import { handleanalyzepdf } from "../Controller/ResumeAnalyze.js";
import uploadMiddleware from "../Middlewares/Multer.js";

const router = express.Router();

router.post("/analyze" ,uploadMiddleware, handleanalyzepdf);


export default router;
