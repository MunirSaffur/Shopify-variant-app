import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createProductMutation, createProuductMediaMutation, fetchProductQuery, createVariantMutation, fetchSalesChannelsQuery, fetchPublishablePublisMutation, fetchLocationQuery } from "../utils/shopifyQueries";
import db from "../db.server";


export const action = async ({ request }) => {
  try {
    console.log("➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️");

    const { admin, session } = await authenticate.public.appProxy(request);
    const { productId, dimension, material, ProductPrice } = await request.json();

    if (!productId) {
      return json({ error: "Missing productId" }, { status: 400 });
    }

    // fetch the original product
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
      status: "ACTIVE",
      // productOptions: [{ name: "Dimensions-Material", values: [{ name: `1` }] }]
    };

    // create new product
    const newProductRes = await admin.graphql(createProductMutation, { variables: { input: productInput } });
    const newProductJson = await newProductRes.json();

    if (newProductJson.data.productCreate.userErrors.length > 0) {
      return json({ errors: newProductJson.data.productCreate.userErrors }, { status: 400 });
    }

    // get the new product ID
    const newProductId = newProductJson.data.productCreate.product.id;

    // create the record to Product model (api/product-list)
    const createdAt = new Date();
    const deleteTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    await db.product.create({
      data: { productId: newProductId, createdAt, deleteTime },
    });

    // add log to app db
    await db.history.create({
      data: { action: "New Product created" },
    });

    // prepare media input
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

    // fetch sales channel IDs
    const channelsRes = await admin.graphql(fetchSalesChannelsQuery);
    const channels = await channelsRes.json();
    const publicationEdges = channels.data.publications.edges;
    const onlineStoreChannel = publicationEdges.find(c => c.node.name === "Online Store");
    const channelId = onlineStoreChannel.node.id;


      // publish product
    await admin.graphql(fetchPublishablePublisMutation,
      {
        variables: {
          id: newProductId,
          publicationId: channelId,
        },
      }
    );

    // fetch location ID for inventory
    const locationRes = await admin.graphql(fetchLocationQuery);
    const locationJson = await locationRes.json();

    if (!locationJson.data?.locations?.edges?.length) {
      return json({ error: "No locations found" }, { status: 400 });
    }
    // location id to set inventory
    const locationId = locationJson.data.locations.edges[1].node.id;

    // create variant with price
    const OptionIds = newProductJson.data.productCreate.product.options;
    const OptionId = newProductJson.data.productCreate.product.options[0].id;

    const variantInput = [
      {
        price: ProductPrice,
        inventoryPolicy: "CONTINUE",
        inventoryQuantities: [
          {
            availableQuantity: 10,
            locationId,           
          }
        ],
        optionValues: [
          {
            "name": `${dimension}-${material}`,
            "optionId": OptionId
          }
        ]
      }
    ]
    const createVariantRes = await admin.graphql(
      createVariantMutation,
      {
        variables: {
          productId: newProductId,
          variants: variantInput,
        }
      }
    );


    // re-fetch the full product with all variants
    const updatedProductRes = await admin.graphql(fetchProductQuery, { variables: { id: newProductId } });
    const updatedProductJson = await updatedProductRes.json();

    return json({
      product: updatedProductJson.data.product,
      variants: updatedProductJson.data.product.variants.edges.map(edge => edge.node),
    });
  } catch (err) {
    console.error("API error:", err);
    return json({ error: err.message, stack: err.stack }, { status: 500 });
  }
};
