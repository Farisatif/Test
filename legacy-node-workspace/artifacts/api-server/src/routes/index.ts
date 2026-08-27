import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(dashboardRouter);
router.use(ordersRouter);

export default router;
