import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Badge, InlineGrid } from "@shopify/polaris";
import db from "../db.server";

// -----------------------------------------------------------------------------
// Home Page with Polaris Components
// -----------------------------------------------------------------------------

export const loader = async ({ request }) => {
  const logList = await db.history.findMany();
  const dimensions = await db.dimension.findMany();
  const materials = await db.material.findMany();
  const products = await db.product.findMany();

  const stats = {
    cartCount: products.length,
    materialsCount: materials.length,
    dimensionsCount: dimensions.length,
    logsCount: logList.length,
  };

  return json({ stats });
};

export default function Home() {
  const { stats } = useLoaderData();

  return (
    <Page title="Dashboard" fullWidth>
      <Layout>
        {/* Top welcome section */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingXl" as="h1">
            👋🏻 Hello!
            </Text>
            <Text variant="bodyMd" as="p">
              Welcome to your admin panel. You can access your quick statistics below.
            </Text>
          </Card>
        </Layout.Section>

        {/* Stats cards in one row (3 columns on desktop) */}
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
            <Card title="Sepete Eklenen Ürünler" sectioned>
            <Text variant="headingLg" as="h2">({stats.cartCount}) Products In Cart  <Badge status="success">Live</Badge></Text>
            </Card>

            <Card title="Varyant Yönetimi" sectioned>
              <Text variant="headingLg" as="p">
                <strong>{stats.materialsCount}</strong> Materials ·{" "}
                <strong>{stats.dimensionsCount}</strong> Dimensions
              </Text>
            </Card>

            <Card title="Kayıtlar (Logs)" sectioned>
              <Text variant="headingLg" as="p">
                ({stats.logsCount}) Total Logs
              </Text>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
