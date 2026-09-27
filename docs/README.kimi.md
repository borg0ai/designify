# Designify for Kimi Code

The Kimi manifest is `.kimi-plugin/plugin.json`. It registers the single skill at `skills/designify/SKILL.md`, loads `designify` at session start, and maps workflow tool names to Kimi Code's tools.

Install this checkout through Kimi Code's local plugin workflow. A public Designify repository URL is not configured: this checkout's Git remote still points to upstream Superpowers. Start a fresh Kimi session after changing plugin state.

Workflow references are not separate skills. Designify reads the matching reference from `skills/designify/workflows/` when the request reaches that stage.
