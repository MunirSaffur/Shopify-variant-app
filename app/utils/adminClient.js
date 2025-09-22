import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import db from "../db.server";

const hostName = process.env.SHOP_CUSTOM_DOMAIN
  ? process.env.SHOP_CUSTOM_DOMAIN.replace(/https?:\/\//, "")
  : "localhost:3000";

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: hostName,
  apiVersion: LATEST_API_VERSION,
});

export async function getAdminClient(shop) {
  // Get stored token from DB
  const session = await db.session.findFirst({
    where: { shop },
  });

  if (!session) throw new Error(`No session found for shop ${shop}`);

  return new shopify.clients.Graphql({
    session: {
      shop: session.shop,
      accessToken: session.accessToken,
    },
  });
}
