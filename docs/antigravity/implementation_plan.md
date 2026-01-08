# Implementation Plan - QuoterPro

## Goal Description
Build a web-based quoting system "QuoterPro" that replaces manual spreadsheet processes. The system will manage company configuration, products/services catalog, and generate professional quotes with flexible calculation logic (Fixed, Linear Meter, Square Meter).

## User Review Required
> [!NOTE]
> We will use **React (Vite)** as the framework and **TailwindCSS** for styling, as requested. This will allow for rapid UI development and a modern look.
> Data persistence will initially use **LocalStorage** to simulate the database (Firestore) for rapid prototyping and offline capability.

## Proposed Changes

### Project Structure
- **Framework**: React (Vite) + TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Icons**: Lucide React or similar

### Data Architecture
We will create a `services` layer to handle data operations, mimicking the Firestore structure:
- `CompanyConfig`: Stores logo, address, folio format.
- `Catalog`: Stores products and services with their calculation types.
- `Quotes`: Stores generated quotes.

### Core Components

#### [NEW] `src/components/layout`
- `AppLayout`: Main shell with navigation.
- `Header`: Top bar with user/company info.

#### [NEW] `src/features/catalog`
- `ProductList`: Table/Grid view of items.
- `ProductForm`: Modal or page to add/edit items, handling the specific fields for ML/M2 calculations.

#### [MODIFY] `src/features/catalog` (Enhancements)
- `ProductList`: Add "Delete" button and "Category" column.
- `ProductForm`: Update Category input to Combobox (Select/Create).
- `CategoryManager`: New component/modal to manage categories (CRUD).

#### [MODIFY] `src/storage.ts`
- Add `Category` interface and storage methods (`getCategories`, `saveCategory`, `deleteCategory`).
- Update `deleteProduct`.

#### [NEW] `src/features/quotes`
- `QuoteEditor`: The core complex component.
    - `CustomerSection`: Input for customer details.
    - `LineItemsTable`: Dynamic table to add products.
    - `CalculationEngine`: Helper functions to compute subtotals based on item type (Fixed, ML, M2).
- `QuotePreview`: Visual representation of the final PDF.

#### [MODIFY] `src/features/quotes` (Refinements)
- `QuoteForm`:
    - Reorder columns: Quantity -> Product -> Dimensions -> Price -> Subtotal.
    - Product Input: Change to Combobox (datalist) to allow free text.
    - Add "Employee" and "Position" fields (auto-save to list).
    - Add "Validity" date picker (default +15 days).
    - Add "Include IVA" toggle.
- `QuotePDF`:
    - Remove "COTIZACION" label.
    - Reorder columns.
    - Update Customer info layout.
    - Hide IVA row if disabled.

#### [NEW] `src/features/quotes/pdf`
- `QuotePDF`: A printable component that formats the quote for A4/Letter size.
- `PrintButton`: Uses `react-to-print` to trigger the browser print dialog (Save as PDF).

### Dependencies
- `react-to-print`: For handling the print process cleanly in React.

## Verification Plan

### Automated Tests
- Verify project builds successfully with `npm run build`.
- Unit tests for the `CalculationEngine` to ensure ML and M2 formulas are correct.

### Manual Verification
- **Company Config**: Upload a logo (mock) and change address; verify it reflects on the quote.
- **Catalog**: Add a product with "Square Meter" calculation.
- **Quote**: Add that product to a quote, enter Width/Height, and verify the Subtotal is correct.
- **Responsive**: Check the UI on mobile view (browser dev tools) to ensure the grid collapses correctly.
