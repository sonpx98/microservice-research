# Keystatic Admin Zone

Separate Next.js app dedicated to Keystatic CMS UI.

## Development

```bash
pnpm dev   # Runs on port 5007
```

## Access

- Local: http://localhost:5007
- With basePath: http://localhost:5007/keystatic

## Multi-Zone Setup

This zone handles `/keystatic` routes when deployed.
The main blog-shell zone rewrites `/keystatic/*` requests here.
