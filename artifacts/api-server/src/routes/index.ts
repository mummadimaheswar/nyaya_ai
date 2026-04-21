import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import analysisRouter from "./analysis";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(analysisRouter);
router.use(dashboardRouter);

export default router;
