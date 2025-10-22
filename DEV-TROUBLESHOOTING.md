# Development Troubleshooting Guide

## Common Vite/Astro Cache Errors

If you encounter errors like:
- `Failed to fetch dynamically imported module`
- `Cannot read properties of null`
- `Outdated Optimize Dep`
- `Failed to fetch astro:scripts/before-hydration.js`
- `ENOENT: no such file or directory, open '.vite/deps_temp_*/_metadata.json'`
- `Failed to execute 'replaceWith' on 'Element': Identifier 'X' has already been declared`

### Quick Fix

**IMPORTANT**: Stop your dev server (Ctrl+C) first!

Then run the clean cache script:
```bash
# Option 1: Using npm script
yarn clean
yarn dev

# Option 2: All-in-one command
yarn fresh

# Option 3: Direct script
./clean-cache.sh
yarn dev
```

**Note**: The script will check if the dev server is running and warn you to stop it first.

### Manual Steps

1. **Clear server caches**:
   ```bash
   rm -rf node_modules/.vite .astro dist
   ```

2. **Clear browser cache**:
   - Close all `localhost:4321` tabs
   - Open DevTools (F12)
   - Right-click the refresh button → "Empty Cache and Hard Reload"
   - Or use incognito/private window

3. **Restart dev server**:
   ```bash
   yarn dev
   ```

### Nuclear Option

If the above doesn't work:
```bash
rm -rf node_modules/.vite .astro dist node_modules
yarn install
yarn dev
```

## Why These Errors Happen

1. **Vite Pre-bundling**: Vite pre-bundles dependencies for faster dev server performance
2. **Cache Mismatch**: When dependencies change or code updates, cached modules can become stale
3. **Browser Cache**: Browsers cache ES modules, which can conflict with updated server code
4. **View Transitions**: Astro's View Transitions can expose timing issues with module loading
5. **Race Conditions**: Clearing cache while dev server is running causes file system race conditions

## Specific Error: `ENOENT: no such file or directory, deps_temp_*`

**Cause**: This happens when:
- You clear the cache while the dev server is running
- Vite is optimizing dependencies and the temp directory gets deleted mid-process

**Solution**:
1. **Always stop the dev server** before clearing cache
2. Use `./clean-cache.sh` which checks for running servers
3. Wait for Vite to finish "optimizing dependencies" before stopping the server

## Specific Error: `Identifier 'X' has already been declared`

**Cause**: This happens when:
- Inline scripts with `is:inline` are re-executed on View Transitions navigation
- Variables are declared at the top level and get redeclared on each navigation

**Solution**:
- This has been fixed by wrapping all inline scripts in IIFEs (Immediately Invoked Function Expressions)
- If you see this error after the fix, try clearing browser cache
- The fix is already applied to all layout files

## Prevention

- Use the clean script before starting work if you haven't run dev server recently
- Clear caches after updating dependencies
- Use incognito window when testing fixes
- Don't modify `node_modules` directly

## Notes

- These errors **only happen in development**
- Production builds (`yarn build`) are **never affected**
- The errors are annoying but harmless - they don't indicate bugs in your code
