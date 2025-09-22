import cron from "node-cron";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { deleteProductMutation } from "../utils/shopifyQueries";
import { getAdminClient } from "../utils/adminClient";

export const startProductCleanupTask = () => {
    console.log("🧹 Starting product cleanup task...");
    // 5 minutes timer
    cron.schedule("*/5 * * * *", async () => {
        const expiredProducts = await db.product.findMany({
          where: { deleteTime: { lte: new Date() } },
        });

        if (!expiredProducts.length) { 
            console.log("✅ No expired products found."); 
            return; 
        }

        console.log(`⚠️ ${expiredProducts.length} expired products found.`);
      
        const shop = process.env.SHOPIFY_SHOP_DOMAIN;
        const admin = await getAdminClient(shop);
      
        for (const product of expiredProducts) {
          try {
            await admin.query({
              data: {
                query: deleteProductMutation,
                variables: { id: product.productId },
              },
            });
      
            await db.product.delete({ where: { id: product.id } });
            
            // add log to app db
            await db.history.create({
                data: { action: `Temp product deleted: ${product.productId}` },
            });

            console.log(`🗑️ Product deleted: ${product.productId}`);
          } catch (err) {
            console.error("Error deleting product:", product.productId, err);
          }
        }
      });
  };