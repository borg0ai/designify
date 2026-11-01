# Designify

Designify is one OpenPlugin package with one skill entrypoint. The skill routes requests to focused workflow references stored beside it. Those references are not separate skills.

## Release 6.5.0

- Ships Designify as one OpenPlugin package with a single skill entrypoint and supporting workflow guidance.
- Includes `@borg0ai/brainstorm-server` 6.5.0, the local daemon used by the visual companion.

## Discover and install

```bash
npx @borg0ai/plugins discover ./designify
npx @borg0ai/plugins add ./designify
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
npx @borg0ai/plugins discover ./designify
```

This inspects the package without installing it.

## Attribution

Author: Albert Li.

Existing copyright and license terms remain in force.
