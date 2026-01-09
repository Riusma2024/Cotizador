# Walkthrough: Watermark and Print Refinements

I have fine-tuned the watermark positioning and print margins to ensure a professional and safe layout.

## Changes Made

### Watermark Positioning
- **Vertical Offset**: The watermark now starts approx. **320px from the top** of the page (previously 280px).
    - This ensures it sits **safely below the customer data header** on the first page.
    - It continues to display on all pages, anchored to this lower starting point.
- **Proportions & Size**: 
    - Maintains the original image aspect ratio.
    - **Customizable Size**: Users can now select from **100%**, **75%**, or **50%** width/height scaling relative to the page container.
- **Image Annex Exception**: 
    - When the Technical Annex contains images, the watermark is **completely hidden** on those pages.
    - **Implementation**: The PDF uses standard safe margins (`1cm 1.5cm`), but the Annex container employs a **negative margin technique** (`-1.5cm` offset) to extend its white background over the margins, ensuring the watermark is covered edge-to-edge without disrupting the rest of the document layout.

### Print Margins
- **Safe Margins**: Restored to **1cm vertical, 1.5cm horizontal** to prevent data cutoff and ensure proper fit on standard printers.
- **Extra Page Prevention**: Optimized the vertical sizing of the Annex section (max `25cm`) to avoid forcing unnecessary blank pages at the end of the document.
    - **Horizontal (1.5cm)**: Prevents the right-aligned content (Folio, Date, Total) from being cut off.
    - **Vertical (1cm)**: Optimizes vertical space while keeping safe distance.

## Verification

### Manual Verification
- [ ] Generate a PDF with a Customer Header.
    - [ ] Verify the watermark starts *below* the customer info block.
- [ ] Generate a multi-page PDF.
    - [ ] Check the bottom of Page 1 and top of Page 2 to ensure content (like totals) isn't cut off.
    - [ ] Verify the watermark appears on Page 2 as well.
