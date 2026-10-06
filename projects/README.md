# Project detail pages

- `cable-pneumatic-soft-robot.html`: Cable-Pneumatic Soft Robot.
- `pneumatic-origami-cubes.html`: Modular Self-Reconfigurable Structure (existing URL preserved).

Each page uses the shared stylesheet and sections Overview, Background, Technical Approach, Results, Videos, and Related Publications. Native MP4 players reference `../assets/videos/`. Navigation points to the homepage anchors.

For a new page, copy an existing page, update its content, add a homepage card, and include its relative filename in the `pages` array in `scripts/build.mjs`. Run the production build before publishing. See the root README for deployment instructions.
