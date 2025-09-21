import cron from "node-cron";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { deleteProductMutation } from "../utils/shopifyQueries";

export const startProductCleanupTask = () => {
    console.log("🧹 Starting product cleanup task...");
    // 5 minutes timer
    cron.schedule("*/5 * * * *", async () => {
      console.log("scanning for expired temp product");
  
      try {
        // Find products where deleteTime has passed
        const now = new Date();
        const expiredProducts = await db.product.findMany({
          where: {
            deleteTime: { lte: now },
          },
        });
  
        if (!expiredProducts.length) {
          console.log("✅ No expired products found.");
          return;
        }
  
        console.log(`⚠️ ${expiredProducts.length} expired products found.`);
  
        const { admin } = await authenticate.admin();
  
        for (const product of expiredProducts) {
          try {
            // delete from shopify admin
            await admin.graphql(deleteProductMutation, {
              variables: { id: product.productId },
            });
  
            // Delete from app database.
            await db.product.delete({ where: { id: product.id } });
  
            console.log(`🗑️ Product deleted: ${product.productId}`);
          } catch (err) {
            console.error("Error deleting product:", product.productId, err);
          }
        }
      } catch (err) {
        console.error("Error running cleanup task:", err);
      }
    });
  };