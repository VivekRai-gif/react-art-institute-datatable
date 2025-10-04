# AIAC Artworks App

This is a Vite + React + TypeScript sample for the Art Institute of Chicago artworks DataTable assignment.

Features implemented:
- Vite + TypeScript scaffold
- PrimeReact DataTable with server-side pagination (lazy)
- Row selection with persistence by storing selected IDs in localStorage

How to run:

1. Install dependencies

```powershell
npm install
```

2. Start dev server

```powershell
# AIAC Artworks App

This is a Vite + React + TypeScript sample for the Art Institute of Chicago artworks DataTable assignment.

Features implemented:
- Vite + TypeScript scaffold
- PrimeReact DataTable with server-side pagination (lazy)
- Row selection persisted to localStorage (only IDs)
- Header select-all on current page
- Bulk-select first N rows across pages (via overlay input)
- Error toast for failed fetch

How to run:

1. Install dependencies

```powershell
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. Build

```powershell
npm run build
```

Notes:
- PrimeReact CSS is included in `src/main.tsx`.

## Submission checklist

Before submitting, confirm the following locally:

- [ ] App is built with Vite + TypeScript
- [ ] PrimeReact DataTable is used
- [ ] Server-side pagination: each page change makes a fresh API call
- [ ] No global array stores rows from multiple pages
- [ ] Row selection persists across pages (localStorage stores IDs only)
- [ ] Header select-all selects rows only on current page
- [ ] Bulk-select first N rows across pages works (example: N=20)
- [ ] Deselection overrides bulk selection and persists
- [ ] Error toast shown on API failure
- [ ] Unit tests pass (`npm run test`)

## Deploy to Netlify

1. Push your repo to GitHub.
2. On Netlify, click "New site from Git" and connect your GitHub repo.
3. Set build command: `npm run build` and publish directory: `dist`.
4. Optionally set environment variables or branch deploys.

Netlify will run the build and deploy automatically.
