// app/routes/app.created-product-list.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, DataTable, LegacyCard, EmptyState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import  db  from "../db.server";

// GraphQL query to fetch product details from Shopify
const fetchProductQuery = `
  query getProduct($id: ID!) {
    product(id: $id) {
      title
      images(first: 1) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            price
          }
        }
      }
    }
  }
`;
// loader
export const loader = async ({ request }) => {
    try {
      const { admin } = await authenticate.admin(request);
  
      // Fetch products from DB
      const createdProducts = await db.product.findMany({
        select: { id: true, productId: true, createdAt: true, deleteTime: true },
        orderBy: { createdAt: "desc" },
      });
  
      const productsWithDetails = await Promise.all(
        createdProducts.map(async (p) => {
          try {
            const res = await admin.graphql(fetchProductQuery, {
              variables: { id: p.productId },
            });
            const json = await res.json();
            const shopifyProduct = json.data?.product;
  
            return {
              ...p,
              title: shopifyProduct?.title || "N/A",
              image: shopifyProduct?.images?.edges[0]?.node.originalSrc || null,
              imageAlt: shopifyProduct?.images?.edges[0]?.node.altText || "",
              price: shopifyProduct?.variants?.edges[0]?.node.price || "N/A",
            };
          } catch (err) {
            console.error("Error fetching Shopify product:", p.productId, err);
            return {
              ...p,
              title: "Error fetching product",
              image: null,
              price: "N/A",
            };
          }
        })
      );
  
      return json({ products: productsWithDetails || [] });
    } catch (err) {
      console.error(err);
      return json({ products: [], error: err.message }, { status: 500 });
    }
  };
  

// component
export default function CreatedProductList() {
    const { products = [] } = useLoaderData();

    const rows = products.map((p) => [
        p.image ? <img src={p.image} alt={p.imageAlt} width={60} /> : null,
        p.title,
        p.price,
        p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
        p.deleteTime ? new Date(p.deleteTime).toLocaleString() : "",
    ]);

    return (
        <Page title="Created Product List">
            {products.length === 0 ? (
                <LegacyCard sectioned>
                    <EmptyState
                        heading="No products created yet"
                        action={{ content: 'Check action logs', url: '/app/logs' }}
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                        <p>Track and receive products created by the side of your customers.</p>
                    </EmptyState>
                </LegacyCard>) :
                (
                    <Card>
                        <DataTable
                            columnContentTypes={["text", "text", "text", "text", "text"]}
                            headings={["Image", "Title", "Price", "Created At", "Delete Time"]}
                            rows={rows}
                        />
                    </Card>
                )
            }
        </Page>
    );
}
