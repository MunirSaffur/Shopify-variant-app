// app/routes/app.create-product.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {Page,Card,Text} from "@shopify/polaris";
import { createProductMutation, createProuductMediaMutation, fetchProductQuery, updateVariantMutation } from "../utils/shopifyQueries";

// --- Main product duplication ---
export const action = async ({ request }) => {
  try {
    console.log("➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️");

    const { admin , session} = await authenticate.public.appProxy(request);
    const { productId, dimension, material, ProductPrice } = await request.json();

    if (!productId) {
      return json({ error: "Missing productId" }, { status: 400 });
    }

    const productRes = await admin.graphql(fetchProductQuery, { variables: { id: productId } });
    const productJson = await productRes.json();

    if (!productJson.data?.product) {
      return json({ error: "Product not found" }, { status: 404 });
    }

    const { product } = productJson.data;

    // Build copy
    const productInput = {
      title: `${product.title} ${dimension} - ${material}`,
      descriptionHtml: product.descriptionHtml,
      tags: "product-will-be-deleted",
      status: "DRAFT"
    };

    const createRes = await admin.graphql(createProductMutation, { variables: { input: productInput } });
    const createJson = await createRes.json();

    const newProductId = createJson.data.productCreate.product.id;

    if (createJson.data.productCreate.userErrors.length > 0) {
      return json({ errors: createJson.data.productCreate.userErrors }, { status: 400 });
    }

    const mediaInput = product.images.edges.map(({ node }) => ({
      originalSource: node.originalSrc,
      alt: node.altText || "",
      mediaContentType: "IMAGE",
    }));

    // add media to the generated product
    await admin.graphql(createProuductMediaMutation, {
      variables: {
        productId: newProductId,
        media: mediaInput,
      },
    });

    // create variant with price
    const variantId = createJson.data.productCreate.product.variants.edges[0].node.id;
    const updateRes = await admin.graphql(
    updateVariantMutation,
      {
        variables: {
          productId: createJson.data.productCreate.product.id,
          variants: [
            {
              id: variantId,
              price: ProductPrice.toString()
            }
          ]
        }
      }
    );

    // safe access:
    const userErrors = updateRes?.data?.productVariantsBulkUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error("variant update errors:", userErrors);
    }

    return json({ product: createJson.data.productCreate.product });
  } catch (err) {
      console.error("API error:", err);
    return json({ error: err.message, stack: err.stack }, { status: 500 });
  }
};

export default function CraeteProduct() {
  return (
    <Page title="Create Product API" >
      <Card sectioned>
        <Text>New Version</Text>
      </Card>
    </Page>
  )
}