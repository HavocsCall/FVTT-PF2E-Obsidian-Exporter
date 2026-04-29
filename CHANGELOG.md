# Changelog

<details>
    <summary>Changelog Entry Format</summary>

    ## [Version Number] - YYYY-MM-DD
    ### Added
    - New features

    ### Changed
    - Changes to existing functionality

    ### Deprecated
    - Features that will be removed in a future version

    ### Removed
    - Features removed in this version

    ### Fixed
    - Bug fixes

    ### Security
    - Security-related fixes
</details>

## [1.2.0] - 2026-03-21
### Added
- New trait export workflow from Module Settings, including a dedicated export dialog and default `Trait.hbs` template.
- New trait markdown export support that packages PF2E trait descriptions into a `Traits.zip` download with one file per trait.
- Added shared export utilities, PF2E text-normalization utilities, and automated tests covering trait/action/link normalization behavior.
- Added CI workflow and documented the available Handlebars helpers and development commands in the README.

### Changed
- Reorganized built-in item templates under `src/handlebars/Items/` and updated all default template setting paths accordingly.
- Refactored item template registration to use centralized template metadata instead of per-type duplicated settings code.
- Improved default item and trait templates to better normalize PF2E text, traits, links, and action metadata for Obsidian-friendly output.
- Normalized and deduplicated exported trait families, including remaster-aware trait name handling.

### Fixed
- Improved export failure handling and user notifications for item, folder, compendium, and trait exports.
- Added localized fallback markdown output when item or trait template rendering fails or when no item template is configured.

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
