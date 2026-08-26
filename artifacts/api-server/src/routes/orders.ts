import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  CreateOrderResponse,
} from "@workspace/api-zod";

export const orders: Array<{
  id: string;
  status: string;
  customerName: string;
  total: number;
  createdAt: string;
}> = [];

const router: IRouter = Router();

router.post("/orders", (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your order details" });
    return;
  }

  const order = {
    id: `BZ-${String(orders.length + 1042).padStart(5, "0")}`,
    status: "Processing",
    customerName: parsed.data.customerName,
    total: parsed.data.total,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  res.status(201).json(CreateOrderResponse.parse(order));
});

export default router;