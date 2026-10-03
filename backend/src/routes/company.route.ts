import companyDirectoryRouter from "./company-directory.route";
import express from "express";
import { authMiddleware, requireRoles } from "../middlewares/auth.middleware";
import companyController from "../controllers/company.controller";
const companyRouter = express.Router();

companyRouter.use("/directory", companyDirectoryRouter);
companyRouter.get("/", companyController.getCompanies);
companyRouter.patch("/:id", authMiddleware, requireRoles("company"), companyController.updateCompany);
companyRouter.get("/:id", companyController.getDetailCompany);
export default companyRouter;
