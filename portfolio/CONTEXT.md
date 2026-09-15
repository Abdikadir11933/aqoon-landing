# Personal portfolio

Public route: `https://aqoon.live/portfolio`.

This is Abducadir Aligure's job-search portfolio, with its own approved design and English copy. It is separate from AQOON's buyer and family journeys. Keep its design, project hierarchy and first-person student voice when making deployment changes.

The maintained source is the owner's `Abdikadir11933/aligure-portfolio` repository. These files are its deployment export, based on source commit `7ccd473e6f8eb5316b9d713e065df8f5e6b5e3b6`. Edit the canonical content there and regenerate the website data and PDF before refreshing this folder.

Vercel serves this repository as static files with `trailingSlash: false`. Asset and PDF paths must therefore start with `/portfolio/`, so both `/portfolio` and `/portfolio/` resolve correctly. Keep hash navigation on the current portfolio page; do not set a base URL that moves project links to a different route.

Only public portfolio assets belong here. Do not copy the source repository's deployment credentials, configuration, private project bank or customer records. The portfolio makes no calls to AQOON's tracker or family database.

For changes, check JavaScript syntax, asset and PDF resolution from the bare route, project navigation and the exact production deployment commit. Follow the root release workflow.
