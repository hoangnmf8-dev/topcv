import express from "express";
import companyController from "../controllers/company.controller";
const companyRouter = express.Router();

companyRouter.get("/", companyController.getCompanies);
companyRouter.patch("/:id", companyController.updateCompany);
export default companyRouter;