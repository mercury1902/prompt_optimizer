# Vite Transform Error Debug Report

**Date:** 2026-04-06  
**Error:** `TypeError: Cannot read properties of undefined (reading 'call')` at `EnvironmentPluginContainer.transform`

## Root Cause

Vite cache corruption. The `node_modules/.vite` directory contained stale cached dependency optimization data that conflicted with the current plugin configuration.

## Investigation

### 1. Configuration Analysis
- **astro.config.mjs:** Uses `@tailwindcss/vite` plugin with Tailwind CSS v4
- **package.json:** 
  - `astro`: ^6.1.3
  - `tailwindcss`: ^4.2.2
  - `@tailwindcss/vite`: ^4.2.2
  - `@astrojs/react`: ^5.0.2

### 2. Files Checked
| File | Status | Notes |
|------|--------|-------|
| astro.config.mjs | OK | Plugin config correct |
| package.json | OK | Version compatibility OK |
| src/styles/global.css | OK | `@import "tailwindcss"` correct for v4 |
| vite.config.ts | N/A | Does not exist |
| tailwind.config.* | N/A | Not needed for Tailwind v4 |
| node_modules/.vite | CORRUPTED | Cache cleared |

### 3. Test Results

**Before fix:**
```
TypeError: Cannot read properties of undefined (reading 'call')
    at EnvironmentPluginContainer.transform
```

**After clearing Vite cache:**
- Dev server: `astro dev` - OK (started on port 4327)
- Build: `astro build` - OK (1 page built in 2.66s)

## Fix Applied

```bash
rm -rf node_modules/.vite
```

Then restart the dev server or rebuild.

## Explanation

Vite's dependency optimization cache (`node_modules/.vite`) can become corrupted when:
1. Plugins are updated without clearing cache
2. Dependencies change versions
3. Vite version upgrades
4. Plugin configurations change

The error `Cannot read properties of undefined (reading 'call')` typically occurs when Vite tries to invoke a plugin transform hook that is either:
- Not properly loaded from cache
- Returns undefined instead of a valid result
- Has corrupted metadata in the cache

## Prevention

Add to package.json scripts:
```json
{
  "scripts": {
    "dev:clean": "rm -rf node_modules/.vite && astro dev",
    "build:clean": "rm -rf node_modules/.vite && astro build"
  }
}
```

Or use `--force` flag with Vite:
```bash
astro dev --force
```

## Summary

**Status:** RESOLVED  
**Root Cause:** Vite cache corruption  
**Fix:** Clear `node_modules/.vite` cache  
**Verification:** Both dev server and build now work correctly

---
**Unresolved Questions:** None
