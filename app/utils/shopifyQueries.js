// Fetch product details query
export const fetchProductQuery = `
    query getProduct($id: ID!) {
    product(id: $id) {
        title
        descriptionHtml
        tags
        images(first: 5) { edges { node { originalSrc altText } } }
        variants(first: 5) {
        edges {
          node {
            id
            title
            price
            inventoryPolicy
            inventoryQuantity
          }
        }
      }
        }
    }
`;


// create new product mutaitoin
export const createProductMutation = `
    mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
        product { 
        id 
        title 
        options {
          id
          name
          optionValues {
            id
            name
            hasVariants
          }
        } 
        variants(first:10) {
        edges {
            node {
            id
            price
                }
            }
        }
        }
        userErrors { field message }
    }
    }
`;

export const deleteProductMutation = `
mutation DeleteProduct($id: ID!) {
  productDelete(input: { id: $id }) {
    deletedProductId
    userErrors {
      field
      message
    }
  }
}`

// craete product media mutation
export const createProuductMediaMutation = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        alt
        mediaContentType
        status
      }
      mediaUserErrors {
        field
        message
      }
    }
  }
`;


export const createVariantMutation =
`
#graphql
  mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      productVariants {
        id
        title
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;


export const fetchLocationsQuery = `
  query getLocations {
    locations(first: 1) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const fetchSalesChannelsQuery = `#graphql
        query publications {
          publications(first: 3) {
            edges {
              node {
                id
                name
                autoPublish
                supportsFuturePublishing
              }
            }
          }
        }`

export const fetchPublishablePublisMutation = `#graphql
  mutation PublishablePublish($id: ID!, $publicationId: ID!) {
    publishablePublish(id: $id, input: { publicationId: $publicationId }) {
      publishable {
        publishedOnPublication(publicationId: $publicationId)
      }
      userErrors {
        field
        message
      }
    }
  }`

  export const fetchLocationQuery = `#graphql
        query {
          locations(first: 5) {
            edges {
              node {
                id
                name
                address {
                  formatted
                }
              }
            }
          }
        }`