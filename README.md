# Shopify Custom Variants App - Remix

This is a project is a [Shopify app](https://shopify.dev/docs/apps/getting-started) built using the [Remix](https://remix.run) framework, [Prisma](https://www.prisma.io/) ORM and [Cron jobs](https://cron-job.org/en/) scheduler.


## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.

### Setup

If you used the CLI to create the template, you can skip this section.

Using npm:

```shell
npm install
```

### Local Development


Using npm:

```shell
npm run dev
```



After every npm run dev kindly chacnge the application_url in:

1. shopify.app.toml file in line: 30 and keep /app/create-product in the last of it.
2. extentions>blocks>variant-form.liquid file in line 61 and keep /api/custom-variants in the last of it


# Shopify-variant-app