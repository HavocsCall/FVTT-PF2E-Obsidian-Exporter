# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-12
### Added
- New helper: `md-contains` for case-insensitive membership checks across arrays, strings, sets, maps, iterables, and object keys/values.

### Changed
- Moved all built-in Handlebars templates from `handlebars/` to `src/handlebars/`.
- Updated default module template setting paths to the new `src/handlebars/*.hbs` location.
- Updated release packaging workflow to stop including the old top-level `handlebars/` directory.
- Refined spell template frontmatter and rendering:
  - Added `SpellType` output (`Focus`, `Ritual`, or `Spell`).
  - Normalized `Sustained` capitalization.
  - Consolidated `Defense` logic using trait-aware checks (`Attack` => `AC`).
  - Guarded action icon output when no action value is present.

## [1.0.0] - 2026-03-05

### Added

- Initial release of PF2E Obsidian Exporter.
- Context menu action: `Export as Markdown` for individual PF2E Items.
- Context menu action: `Export as Markdown` for Item folders.
- Context menu action: `Export as Markdown` for Item compendium packs.
- Markdown export pipeline based on Handlebars templates.
- ZIP export for folders and compendiums, including nested folder path preservation.
- Built-in template settings per supported PF2E item type:
  - Action
  - Ammo
  - Ancestry
  - Armor
  - Background
  - Class
  - Condition
  - Consumable
  - Container
  - Deity
  - Equipment
  - Feat
  - Heritage
  - Shield
  - Spell
  - Treasure
  - Weapon
- Handlebars helper suite for markdown formatting and PF2E-specific value normalization.
