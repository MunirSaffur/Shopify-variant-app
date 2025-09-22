// app/routes/app.created-product-list.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, DataTable, LegacyCard, EmptyState } from "@shopify/polaris";
import  db  from "../db.server";

// loader
export const loader = async ({ request }) => {
    try {  
      // Fetch logs from DB
      const logList = await db.history.findMany({
        select: { id: true, action: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
  
      return json({ logs: logList || [] });
    } catch (err) {
      console.error(err);
      return json({ products: [], error: err.message }, { status: 500 });
    }
  };
  

// component
export default function CreatedProductList() {
    const { logs = [] } = useLoaderData();

    const rows = logs.map((l) => [
        l.action,
        l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
    ]);

    return (
        <Page title="Log List">
            {logs.length === 0 ? (
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
                            columnContentTypes={["text", "text"]}
                            headings={["Action", "Recorded On"]}
                            rows={rows}
                        />
                    </Card>
                )
            }
        </Page>
    );
}
