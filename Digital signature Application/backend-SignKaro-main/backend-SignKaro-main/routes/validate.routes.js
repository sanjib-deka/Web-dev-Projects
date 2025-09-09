import express from "express";
import { activateSeal, verifySeal } from "../Controllers/validate.controller.js";



// Create a router instance
const sealRouter = express.Router();

sealRouter.post("/activateSeal", activateSeal);
sealRouter.post("/verifySeal", verifySeal);


export default sealRouter;

