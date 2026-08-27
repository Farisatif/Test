import { Router, type IRouter } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { products } from "./catalog";
import { orders } from "./orders";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAdmin, (_req, res) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  res.json(
    GetDashboardSummaryResponse.parse({
      totalProducts: products.length,
      totalOrders: 128 + orders.length,
      totalRevenue: 12480 + totalRevenue,
      conversionRate: 4.8,
    }),
  );
});

export default router;