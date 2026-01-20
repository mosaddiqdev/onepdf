# New Features & Major Improvements

These are larger feature additions that would significantly expand the capabilities and value of the application.

## 1. 🖼️ Visual Page Selector & Reordering

**Concept**: instead of treating a PDF as a "black box" file, let users expand it to see thumbnails of all pages.

- **Features**: - **Pick & Choose**: Uncheck specific pages to exclude them (e.g., remove cover pages). - **Inter-file Reordering**: Drag page 3 of File A to be before page 1 of File B. - **Rotation**: Rotate individual pages that are upside down.
  **Technical**: Requires rendering thumbnails efficiently in the Worker before the main process step.

## 2. 🧩 Custom Grid Builder

**Concept**: Move beyond the fixed "2, 3, 4, 6 pages per sheet" presets.

- **Features**:
  - Input fields for **Rows** and **Columns** (e.g., 2x5 for flashcards).
  - Custom **Margin** and **Gap** sliders (currently hardcoded PADDING/GAP constants).
  - **Paper Size**: Support Letter, Legal, A3, not just A4.

## 3. 📤 PWA Share Target

**Concept**: Allow users to share a PDF _from_ another app (like WhatsApp, Files, or Mail) _directly to_ 1PDF.

- **Features**: - Register as a `share_target` in `site.webmanifest`. - Handle the incoming file stream in the app launch.
  **Why**: deeply integrates the app into the mobile OS ecosystem, making it feel native.

## 4. 📉 Smart PDF Compression

**Concept**: Reduced file size for the output PDF.

- **Features**:
  - "Quality" slider (Low/Medium/High).
  - Downsample images in the Worker during the canvas-to-PNG conversion (adjusting the resolution).
  - Currently, `pdf-lib` embedding PNGs can be large. Optimizing this stream would save bandwidth for users sharing the result.

## 5. 📸 Image-to-PDF Support

**Concept**: Allow users to drop `.jpg`, `.png`, `.webp` files mixed with PDFs.

- **Features**:
  - Automatically convert images to PDF pages internally.
  - Combine lecture slides (images) with notes (PDF) in one go.

## 6. 🖊️ One-Click Watermark

**Concept**: Add security/branding to the output.

- **Features**:
  - Text watermark ("DRAFT", "CONFIDENTIAL", or custom text).
  - Opacity and angle controls.
  - Applied universally to the output sheets.
