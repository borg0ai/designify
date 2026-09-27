# Designify

Designify is one OpenPlugin package with one skill entrypoint. The skill routes requests to focused workflow references stored beside it. Those references are not separate skills.

## Discover and install

```bash
npx plugins discover ./designify
npx plugins add ./designify
```

`designify/.plugin/plugin.json` is the vendor-neutral manifest read by the Plugins CLI. Skill content lives once under `designify/skills/designify/`; the CLI translates the package for supported agent tools during installation.

For project work, Designify uses Specify to create and validate RFCs under `.spec/rfc/`. The approved RFC is the implementation plan. TDD notes and SDD execution artifacts go under `.designify/tdd/` and `.designify/sdd/`; product tests stay in the project's normal test locations.

## Package layout

- `designify/.plugin/plugin.json` identifies the plugin.
- `designify/skills/designify/SKILL.md` is the only skill entrypoint.
- `designify/skills/designify/workflows/` holds supporting workflow references.
- `tests/` remains repository development material, outside the installable plugin.

## Verify discovery

```bash
npx plugins discover ./designify
```

This inspects the package without installing it.

## Attribution

Author: Albert Li.

Designify consolidates Superpowers source from this checkout. Existing copyright and license terms remain in force. The Git remote still identifies the upstream repository; this change does not publish or move that repository.
