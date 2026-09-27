# Designify for OpenCode

Use `.opencode/INSTALL.md` for local checkout setup. The adapter supports OpenCode V1 and V2, registers one skill (`designify`), and injects the same workflow router at session start.

The OpenCode plugin source lives at `.opencode/plugins/designify.js`; the root `index.js` supports directory-form registration. V2 requires the repository directory and rejects direct JavaScript-file paths.

No public Designify release exists in this checkout. Its configured Git remote still points to upstream Superpowers, so use a local checkout of the migrated files.
