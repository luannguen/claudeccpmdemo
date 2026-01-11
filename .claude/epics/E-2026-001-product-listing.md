---
name: Implement Product Listing Page
status: completed
progress: 100%
created: 2026-01-11T02:30:00Z
updated: 2026-01-11T02:38:00Z
---

# Epic: Implement Product Listing Page (with MongoDB)

## Goal Description
Implement the Product Listing Page with real data persistence using a local MongoDB database working via a simple Express backend.

## Architecture Change
- **Frontend**: Vite + React (Port 5173) -> Calls API
- **Backend**: Express + Mongoose (Port 3000) -> Connects to MongoDB (mongodb://localhost:27017/ccpm_shop)

## Proposed Changes

### 1. Backend Layer (`/server`)
- **Setup**: Initialize `server/package.json` with `express`, `mongoose`, `cors`.
- **Database**: Connect to `mongodb://localhost:27017/ccpm_shop`.
- **Schema**: `Product` (name, price, image, description, category).
- **API Endpoints**:
    - `GET /api/products`: List all products.
    - `POST /api/products/seed`: Seed initial data.

### 2. Frontend Data Layer (`src/services`)
- **File**: `src/services/productService.ts`
- **Updates**: Change from mock delay to `fetch('http://localhost:3000/api/products')`.
- **Error Handling**: Map HTTP errors to `Result<T>` failures.

### 3. Feature Logic Layer (`src/hooks/features`)
- **File**: `src/hooks/features/useProductList.ts`
- **Logic**: Unchanged (Architecture benefit! Hook doesn't care source is real DB).

### 4. UI Layer (`src/features/products`)
- **Components**: `ProductGrid`, `ProductCard`, `ProductPage`.

## Verification Plan
1.  **Backend**: Start server `node server/index.js`. Verify connection log.
2.  **Seed**: Call `POST /api/products/seed` via Curl or Browser.
3.  **Frontend**: Refresh webapp. Verify data loads from DB.
