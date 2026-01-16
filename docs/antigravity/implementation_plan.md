# Fix: Blank Page in Annex PDF

The "Technical Annex" section in the PDF currently uses a fixed-height container with absolutely positioned elements, nested inside a single table row. This often causes the browser to miscalculate page breaks, resulting in empty pages and incorrect layout.

## Proposed Changes

### [Component] [QuotePDF.tsx](file:///c:/Users/pc/.gemini/antigravity/scratch/Cotizador/quoter-pro/src/features/quotes/pdf/QuotePDF.tsx)

#### [MODIFY] [QuotePDF.tsx](file:///c:/Users/pc/.gemini/antigravity/scratch/Cotizador/quoter-pro/src/features/quotes/pdf/QuotePDF.tsx)
- Restructure the `table` to handle the Annex as a separate `tbody` or a separate `tr`.
- Add `page-break-before: always` to the Annex section to ensure it starts on a clean page, avoiding awkward breaks with the quote items.
- Adjust the `tfoot` and `thead` CSS to be more robust.
- Fix the page counter reset logic to ensure it counts correctly across all pages.
- Ensure the Annex container doesn't have unnecessary margins that could trigger trailing blank pages.

## Verification Plan

### Manual Verification
1.  **Prepare Test Data**:
    - Create or edit a quote.
    - Add several items to the quote.
    - Go to the "Technical Annex" section.
    - Add at least 2 images and position them at different heights.
2.  **Test Printing**:
    - Click "Imprimir / PDF".
    - In the print preview, verify:
        - The Quotation Items are on the first page(s).
        - The Technical Annex starts on a new page.
        - There are no blank pages at the end.
        - The header and footer appear correctly on all pages.
        - Page numbers are sequential (e.g., Página 1, Página 2).
