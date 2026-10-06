# Songjie Jia academic website

A static HTML/CSS/JavaScript website. No React, Next.js, Vite, package installation, or server runtime is required. Node.js 22 or newer is used only for validation, packaging, and local preview.

## Production build and preview

Run from the project folder:

```powershell
node scripts/build.mjs
node scripts/preview.mjs
```

Open http://127.0.0.1:4173. Stop the preview with Ctrl+C.

The build validates local links, anchors, filename case, PDF/MP4 signatures, H.264 markers, and JavaScript syntax. It recreates `dist/` with only the three HTML pages and their referenced assets. It does not fetch external URLs. No npm install is needed.

## Files to maintain

- `index.html`: homepage sections.
- `styles.css`, `script.js`: shared styling and navigation.
- `projects/cable-pneumatic-soft-robot.html`: first project.
- `projects/pneumatic-origami-cubes.html`: Modular Self-Reconfigurable Structure. The existing route is retained deliberately.
- `assets/`: referenced images and two MP4 files in `assets/videos/`.
- `cv/resume-songjie.pdf`: embedded CV.
- `scripts/build.mjs`, `scripts/preview.mjs`: dependency-free build and preview.
- `vercel.json`: static deployment configuration.

When adding a new detail page, add it to the `pages` array in `scripts/build.mjs`. Assets referenced by the HTML are packaged automatically. Use case-correct relative URLs. The native PDF viewer varies by browser, especially on mobile; video controls are native browser controls.

Original uploads in the project root, the older unused CV, and unrelated local research folders are retained locally but excluded by `.gitignore`. Do not upload those manually. Do not commit `dist/`; Vercel rebuilds it.

## Publish through GitHub and Vercel

1. Create an EMPTY GitHub repository named `personal-website` in your account. Do not initialize it with a README, license, or gitignore. Public or private is fine for connecting to Vercel.
2. In PowerShell, open this project folder and run:

```powershell
git init -b main
git add .
git status --short
```

Review the staged list: include the site files, assets, CV, scripts, documentation and configuration; original uploads and `dist/` should be absent. If Git asks for an author identity, configure your own name/email, then continue:

```powershell
git commit -m "Prepare academic website for deployment"
git remote add origin https://github.com/Songjie-Jia/personal-website.git
git push -u origin main
```

If you choose a different repository name or account, substitute its actual URL. Authenticate through Git's browser prompt when requested.

3. Sign into Vercel with GitHub. Select **Add New > Project**, grant access to this repository, and import it.
4. Confirm these settings (the checked-in `vercel.json` supplies build/output settings):
   - Framework Preset: **Other**
   - Root Directory: repository root (`.`)
   - Build Command: `node scripts/build.mjs`
   - Output Directory: `dist`
   - Install Command: leave unset/default (no dependencies)
   - Environment Variables: none
5. Click **Deploy**. Keep the `.html` routes; no SPA rewrites are needed.
6. Open the production URL and check the navigation, both project detail pages, CV scrolling/zoom, and both videos (play, seek, fullscreen). Check DOI and LinkedIn manually because their hosts blocked automated requests during the local audit.
7. Optional: add your domain under the project's **Settings > Domains**, then follow Vercel's displayed DNS instructions.

Future updates: edit, run `node scripts/build.mjs`, commit, and push to `main`. The connected Vercel project deploys pushes automatically.

Official instructions:
- https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/vercel-json

## Deployment audit (2026-10-05)

Production build passed: 3 pages, 14 files, approximately 38.07 MiB. No absolute Windows paths, missing assets, broken internal routes/anchors, or placeholder links were found in the published files. The existing design and visible content were preserved; editing comments were removed.

Local HTTP preview returned 200 for all three pages, the CV and both videos, with correct PDF/MP4 MIME types. PDF and MP4 range requests returned 206. Both MP4s contain H.264 markers and place their metadata (`moov`) before media (`mdat`) for progressive loading. These are file/delivery checks, not a full browser playback test.

GitHub and Google Scholar returned HTTP 200. DOI returned HTTP 403 and LinkedIn returned HTTP 999 to automated requests; those URLs are retained and require manual verification. Browser automation was unavailable due to a local sandbox startup error, so interactive PDF controls and video playback were not verified. Nothing has been published yet; final checks on a Vercel preview/production URL remain necessary.
