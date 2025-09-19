// Fetch product details query
export const fetchProductQuery = `
    query getProduct($id: ID!) {
    product(id: $id) {
        title
        descriptionHtml
        tags
        images(first: 5) { edges { node { originalSrc altText } } }
        variants(first: 1) {
        edges {
          node {
            id
            title
            price
            sku
            inventoryPolicy
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
        handle 
        }
        userErrors { field message }
    }
    }
`;

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

