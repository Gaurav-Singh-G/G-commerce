# E-Commerce Application

An e-commerce project containing two Next.js applications:

- `ecom-user`: customer storefront
- `ecom-admin`: administrator dashboard

Both applications use MongoDB. Product images are uploaded to Azure Blob Storage through the admin server.

## Architecture

```text
Customer browser → ecom-user → MongoDB
Admin browser    → ecom-admin → MongoDB
Admin browser    → ecom-admin/api/upload → Azure Blob Storage
```

The browser does not connect directly to MongoDB. The upload API also communicates with Azure server-side.

## Project structure

### `ecom-user`

Customer-facing application.

- `pages/index.js` — homepage
- `pages/products.js` — product listing
- `pages/product/[id].js` — product details
- `pages/cart.js` — shopping cart
- `pages/api/cart.js` — cart API
- `pages/api/checkout.js` — checkout API
- `pages/api/webhook.js` — payment webhook
- `components/CartContext.js` — cart state
- `models/Product.js` — product model
- `models/Order.js` — order model
- `lib/mongoose.js` — MongoDB connection

### `ecom-admin`

Administrator application.

- `pages/index.js` — dashboard
- `pages/products.js` — product management
- `pages/products/new.js` — create product
- `pages/products/edit/[...id].js` — edit product
- `pages/categories.js` — category management
- `pages/orders.js` — order management
- `pages/api/products.js` — product API
- `pages/api/categories.js` — category API
- `pages/api/orders.js` — order API
- `pages/api/upload.js` — image upload API
- `pages/api/auth/[...nextauth].js` — authentication
- `models/` — MongoDB models
- `lib/mongoose.js` — MongoDB connection

## Requirements

Install:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Azure Blob Storage
- Payment-provider account, if checkout is enabled

Verify Node.js and npm:

```bash
node --version
npm --version
```

## Installation

Clone or download the project, then install dependencies separately:

```bash
cd ecom-user
npm install

cd ../ecom-admin
npm install
```

## Running locally

Start the customer application:

```bash
cd ecom-user
npm run dev
```

Start the admin application in another terminal:

```bash
cd ecom-admin
npm run dev -- -p 3001
```

The terminal will display the URLs for both applications.

## Environment variables

Create a `.env.local` file in each application.

### `ecom-user/.env.local`

Use the exact variable names referenced by the files in `ecom-user/pages/api`:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret
PAYMENT_SECRET_KEY=your_payment_secret
PAYMENT_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `ecom-admin/.env.local`

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
ADMIN_EMAILS=admin@example.com
STORAGE_SAS_TOKEN=your_azure_sas_token
STORAGE_RESOURCE_NAME=your_azure_storage_account_name
```

Never commit `.env` or `.env.local` files.

## Application flow

### Product and image management

1. An administrator signs in to `ecom-admin`.
2. The administrator creates or edits a product.
3. Images are sent to `ecom-admin/pages/api/upload.js`.
4. The server uploads images to Azure Blob Storage using `BlobServiceClient`.
5. Azure image URLs are returned to the admin application.
6. Product data and image URLs are saved in MongoDB.
7. The storefront displays the products and images.

### Customer shopping

1. A customer browses products.
2. Product details are loaded server-side.
3. The customer adds products to the cart.
4. Checkout is sent to `ecom-user/pages/api/checkout.js`.
5. The payment provider processes the payment.
6. The provider sends an event to `ecom-user/pages/api/webhook.js`.
7. The order is saved or updated in MongoDB.
8. Administrators view orders in `ecom-admin`.

## MongoDB setup

1. Create a MongoDB Atlas cluster or start a local MongoDB server.
2. Create a database user.
3. Add the MongoDB connection string to `MONGODB_URI`.
4. Allow the development IP address in MongoDB Atlas.
5. Start both applications.

Main collections include:

- `products`
- `categories`
- `orders`

## Adding a product

1. Open `http://localhost:3001`.
2. Sign in as an administrator.
3. Open **Products**.
4. Select **New product**.
5. Enter the product details and upload images.
6. Save the product.
7. Open `http://localhost:3000`.
8. Confirm that the product is visible.

## Testing checkout

1. Add a product to the cart.
2. Open the cart.
3. Start checkout.
4. Use the payment provider's test credentials.
5. Confirm that the webhook receives the payment event.
6. Check the order in the admin dashboard.

## Azure Blob Storage and CORS

The current upload flow is server-side:

```text
Admin browser → ecom-admin/api/upload.js → Azure Blob Storage
```

The browser does not upload directly to Azure. Therefore, Azure CORS is not required for the current upload implementation.

Normal image rendering with an image URL also does not normally require CORS. CORS would only be needed if browser JavaScript directly uploaded to Azure, fetched Azure resources, or used the images in a canvas.

## Security

- Keep MongoDB credentials server-only.
- Keep Azure SAS tokens server-only.
- Do not use `NEXT_PUBLIC_` for secrets.
- Validate administrator authentication.
- Validate file types and upload sizes.
- Do not trust client-supplied prices during checkout.
- Use separate production secrets.
- Do not commit environment files.
- Restrict Azure storage access where possible.

## Production build

Run the following commands separately in each application folder:

```bash
npm run build
npm start
```

Before deployment:

- Use production database credentials.
- Use production payment keys.
- Configure the payment webhook URL.
- Set secure authentication secrets.
- Verify Azure upload permissions.
- Configure image hosts in `next.config.js` if using `next/image`.
- Remove unused test API routes.

## Troubleshooting

### MongoDB connection errors

Check:

- `MONGODB_URI`
- MongoDB Atlas IP access
- Database username and password
- Special characters in the connection string

### Images do not load

Check:

- Azure storage account name
- Azure SAS token
- Container name
- Stored image URLs
- Upload API errors
- `next.config.js` image configuration

### Checkout fails

Check:

- Payment secret key
- Webhook secret
- Webhook URL
- Payment-provider logs
- Server terminal output

### Admin authentication fails

Check:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Authentication configuration
- Browser cookies
- Admin session handling