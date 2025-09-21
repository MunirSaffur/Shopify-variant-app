import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';

export const loader = async ({request}) => {
  try {
    const product = await db.product.findMany({
      select: { id: true, productId: true, createdAt: true, deleteTime: true },
      orderBy: { createdAt: 'desc' }
    });

    const response = json({
      data: { products: product },
    });

    return cors(request, response);

  } catch (err) {
    console.error("API error:", err);
    return json({ error: `Internal Server Error: ${err}` }, { status: 500 });
  }
};


export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId")?.toString();

    if (!productId) {
      return json({ error: "Missing or invalid productId" }, { status: 400 });
    }

    // Set timestamps
    const createdAt = new Date();
    const deleteTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    // create the record
    const record = await db.product.create({
      data: { productId, createdAt, deleteTime },
    });

    return cors(request, json({ success: true, record }));
  } catch (err) {
    console.error("Action error:", err);
    return json({ error: `Internal Server Error: ${err.message}` }, { status: 500 });
  }
};

