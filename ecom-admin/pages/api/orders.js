import {mongooseConnect} from "@/lib/mongoose";
import {Order} from "@/models/Order";

export default async function handler(req,res) {
  await authorizeAdminRequest(req, res);
  await mongooseConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  res.json(await Order.find().sort({createdAt:-1}));
}