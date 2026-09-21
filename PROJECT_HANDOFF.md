# Project Handoff: StepJourney (Field Sales & Outlet Visit App)

## 1. Project Overview
StepJourney is a mobile-first, offline-capable Progressive Web Application (PWA) designed for FMCG field sales teams (Order Bookers / Salesmen). The application facilitates daily outlet visits (PJP), order booking, sales returns, stock surveys (Brand Positioning), and end-of-day reporting. 

It is built to operate efficiently in low-connectivity environments by heavily utilizing browser local storage, ensuring that the field force can continue working seamlessly without a constant internet connection.

## 2. Tech Stack
- **Framework:** Next.js 14 (App Router, Static Export)
- **UI Library:** React 18
- **Styling:** Tailwind CSS (Mobile-first, responsive design)
- **Language:** TypeScript
- **Backend / Database:** Supabase (Auth & Remote Sync) + `localStorage` (Offline First)
- **Deployment:** GitHub Pages (via `npm run build` and `next export` configurations)

## 3. Application Architecture & Folder Structure
The application follows standard Next.js App Router conventions:

- `/app` - Contains all routing and primary screen components.
  - `/page.tsx` - The main PJP / Outlet list view.
  - `/order/page.tsx` - The comprehensive order booking and invoice generation engine.
  - `/return/page.tsx` - Sales return module.
  - `/brand-positioning/page.tsx` - Merchandising and stock survey module.
  - `/report/page.tsx` - Printable end-of-day Cash and Stock Summary.
  - `/export/page.tsx` - Bulk invoice PDF generation and sharing interface.
  - `/add-outlet/page.tsx` - Interface to register new outlets.
- `/components` - Reusable UI components.
  - `OutletCard.tsx` - The primary card component for outlets, housing quick-action buttons.
  - `PrintInvoice.tsx` - A hidden, highly optimized A4 layout for rendering print/PDF invoices natively via CSS.
- `/lib` - Utility functions and shared definitions.
  - `supabase.ts` - Client initialization for Supabase.
  - `types.ts` - TypeScript interfaces for Outlet and Visit statuses.
  - `geo.ts` - Geolocation services and Google Maps routing.

## 4. Core Features & Workflows

### A. Outlet Management & Routing (PJP)
- **List & Filter:** Displays the day's planned journey. Salesmen can filter by status (Visited, Billed, Unbilled, Revisit Required, etc.).
- **Quick Actions:** Each outlet card (`OutletCard.tsx`) provides immediate access to GPS navigation, Ordering, Returns, QC, and Brand Positioning.
- **Status Updates:** Outlets can be marked as Closed, Shifted, Not Found, or Revisit Required via a dropdown menu dynamically positioned to avoid clipping issues.

### B. Order Booking Engine (`calcOrder`)
The order engine is robust and handles complex FMCG business rules natively in JavaScript:
- **Product Master:** Hardcoded SKU lists containing Trade Price (TP), grams (gm), carton conversions (`pcsPerCtn`), and channel-specific offers (GT, MT, Wholesale).
- **Calculations:**
  - **Gross Amount:** Quantity × Trade Price.
  - **Trade Offer / Discount:** Automatically applies percentage discounts based on the outlet's channel (e.g., GT vs. MT).
  - **Slab Discount:** Volume-based tiered discounts based on the Net Amount.
  - **Taxes:** Computes 18% or 22% GST (Registered vs. Unregistered) and Advance Tax (1% or 2.5%).
- **Cart Management:** Safe clamping logic prevents zero or negative quantities.

### C. Print & PDF Generation
Instead of relying on heavy third-party PDF libraries (like `jspdf`), the app utilizes native browser print engines paired with strict `@media print` CSS. 
- Generating an invoice switches the DOM into a pure A4 layout, hiding navigation and UI toolbars.
- **Bulk Export:** Iterates through all selected orders, splitting them with `page-break-after: always` to generate massive combined PDFs natively.

### D. Brand Positioning Survey
A compact, mobile-optimized merchandising form matching Google Stitch design specifications:
- **SKU Stock:** Allows entry in both Units and Cartons. The app automatically calculates normalized units in the background.
- **Conditional Logic:** LMT Primary Shelf details only appear for Modern Trade (LMT) outlets. External Branding and Out-of-Category Display (OCD) reveal photo capture buttons conditionally.

### E. End-of-Day Reporting
Generates a printable "Salesman Cash and Stock Summary" crossing all daily orders, consolidating SKU totals and Outlet net payables for easy warehouse reconciliation.

## 5. Data Management (Offline-First)
To guarantee performance, the app intercepts typical database requests and caches them in the browser:
- `todayOutlets`: Stores the loaded PJP/Outlet list.
- `orders_YYYY-MM-DD`: Stores finalized orders/invoices for the day. Reports and Exports read directly from here.
- `survey_YYYY-MM-DD`: Stores completed Brand Positioning surveys.

*Data is designed to be synchronized back to Supabase when a stable connection is detected, though local structures hold the authoritative state during a shift.*

## 6. Build & Deployment Rules
- **Strict Builds:** The project uses Next.js `npm run build`. The build process strictly enforces type checking. 
- **Lightweight Philosophy:** External dependencies are kept to an absolute minimum. (e.g., ESLint is not forced as a build-breaking dependency, and heavy PDF libraries are intentionally avoided).
- **Hosting:** The output is a static export hosted perfectly on GitHub Pages. Any push to the `main` branch triggers the deployment pipeline.

## 7. Next Steps / Future Considerations
1. **Sync Architecture:** Implement the background sync worker that flushes the `localStorage` queues (`orders_YYYY-MM-DD` and `survey_YYYY-MM-DD`) to Supabase when the user returns to Wi-Fi.
2. **Product Master DB:** Move the hardcoded `PRODUCTS` array into a Supabase table that caches locally on app boot.
3. **Photo Storage:** Connect the camera capture buttons in the Brand Positioning survey to Supabase Storage buckets, saving the local URL until synchronization.
