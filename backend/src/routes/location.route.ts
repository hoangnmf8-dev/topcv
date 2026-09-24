import express from "express";
import locationController from "../controllers/location.controller";
const locationRouter = express.Router();
locationRouter.get("/province", locationController.getProvice);
export default locationRouter;