# Implementation Plan - Category Filter & Extended Add Book Category

This plan details the implementation for extending the 'Add Book' feature with standard category options and adding a category dropdown filter in the top toolbar of the book list view.

## User Preferences
- **Filter Placement**: Dropdown selector in the top toolbar alongside the search box.
- **Categories**: Standard set (`Semua Kategori`, `Ilmu Komputer`, `Fiksi`, `Sastra`, `Sains`, `Sejarah`).

---

## Proposed Changes

### 1. API Updates (`/src/app/api/books/route.ts`)
- Update `GET /api/books` route to accept an optional `category` query parameter alongside `q`.
- Filter query results by matching the `kategori` field in Cloud SQL and Firestore snapshot records.
- Ensure fallback array filtering handles both search query `q` and category filter `category`.

### 2. Dashboard UI Updates (`/src/components/Dashboard.tsx`)
- Add `selectedCategory` state initialized to `'Semua'`.
- Render a category `<select>` dropdown next to the search bar in the top header when on the 'buku' tab.
- Update `fetchData` to pass `category` parameter in the API request URL: `/api/books?q=...&category=...`.
- Ensure 'Add Book' and 'Edit Book' modal select inputs include the standard category options (`Ilmu Komputer`, `Fiksi`, `Sastra`, `Sains`, `Sejarah`).

---

## Verification Plan

### Automated Build Verification
- Execute `compile_applet` to confirm zero compilation or TypeScript errors.

### Manual Verification
1. Navigate to **Data Buku** tab.
2. Filter books using the category dropdown selector next to search bar and verify list filters instantly.
3. Open **Tambah Buku** modal, choose a category (e.g. `Sains`), submit, and verify it appears under the selected category.
4. Verify entry persistence across Firestore and Cloud SQL.
