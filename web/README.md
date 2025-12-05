# ZeroTrace Website

This is the official website for **ZeroTrace – Secure Data Wiping**, a NIST 800-88 Purge-level Android data-erasure solution.

## Project Structure

```
/root
  index.html          # Landing Page
  /pages
    download.html     # App Download
    certificate.html  # Certificate Generator
    compare.html      # Comparison Page
    rewards.html      # Rewards Program
    awareness.html    # Educational Modules
  /css
    styles.css        # Global Styles & Custom Animations
  /js
    main.js           # Global UI Logic
    certificate.js    # PDF & QR Logic
    rewards.js        # Rewards Form Logic
    awareness.js      # Quiz & Accordion Logic
  /assets             # Images & Icons
```

## Features

- **Glassmorphism UI**: Premium, modern aesthetic with blurred backgrounds and neon accents.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Certificate Generator**: Client-side PDF generation using `jsPDF` and QR codes using `qrcode.js`.
- **Deep Linking**: "Erase Now" buttons attempt to open the installed app via `zerotrace://` scheme.
- **Interactive Elements**: Quizzes, accordions, and smooth scroll animations using `AOS`.

## Deployment Instructions (GitHub Pages)

1.  **Push to GitHub**:
    *   Initialize a git repository: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit"`
    *   Push to your repository.

2.  **Enable GitHub Pages**:
    *   Go to your repository **Settings**.
    *   Navigate to **Pages**.
    *   Under **Source**, select `main` (or `master`) branch and `/root` folder (if applicable, otherwise just root).
    *   Save.

## Backend Integration Notes

Currently, the forms (Rewards, Certificate) are client-side simulations. To connect a backend:

1.  **Certificate**:
    *   Update `js/certificate.js` to POST device data to an API endpoint.
    *   Verify the hash on the server before returning a signed PDF URL.

2.  **Rewards**:
    *   Update `js/rewards.js` to submit the claim to a backend database.
    *   Implement email verification logic.

## Libraries Used (CDN)

- Tailwind CSS
- AOS (Animate On Scroll)
- Feather Icons
- jsPDF
- QRCode.js
