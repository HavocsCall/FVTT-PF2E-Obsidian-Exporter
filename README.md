# PF2E Obsidian Exporter

A Foundry VTT module for Pathfinder 2e that exports PF2E Items to Markdown files designed for Obsidian workflows.

## Features

- Adds `Export as Markdown` to:
  - Individual PF2E Items
  - Item folders (recursive)
  - Item compendium packs (recursive)
- Exports a single item as one `.md` file.
- Exports folders/compendiums as a `.zip` containing one Markdown file per item.
- Preserves folder structure when exporting folders and compendiums.
- Includes default Handlebars templates for PF2E item types:
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
- Lets you override template paths per item type in module settings.

## Requirements

- Foundry VTT v13+
- Pathfinder 2e (`pf2e`) game system

## Installation

Install like any other Foundry module:

1. Open Foundry VTT.
2. Go to `Add-on Modules`.
3. Install using this Manifest URL `https://github.com/HavocsCall/FVTT-PF2E-Obsidian-Exporter/releases/latest/download/module.json`.
4. Enable **PF2E Obsidian Exporter** in your world.

## Usage

### Export a single item

1. Open the Items directory.
2. Right-click an item.
3. Click `Export as Markdown`.
4. A `.md` file is downloaded.

### Export an item folder

1. Right-click an item folder in the Items directory.
2. Click `Export as Markdown`.
3. A `.zip` file is downloaded with item markdown files.

### Export an item compendium

1. Open Compendium Packs.
2. Right-click an Item compendium pack.
3. Click `Export as Markdown`.
4. A `.zip` file is downloaded with item markdown files.

## Configuration

Go to `Game Settings -> Configure Settings -> Module Settings -> PF2E Obsidian Exporter`.

Each supported item type has a template path setting. By default, templates point to:

`modules/FVTT-PF2E-Obsidian-Exporter/handlebars/*.hbs`

You can replace these with your own Handlebars templates to match your Obsidian vault conventions.

## Notes

- Export actions appear for all items, but template support is defined per item type.
- If an item type has no configured template, export still succeeds with a fallback Markdown message.
- Filenames are sanitized to avoid invalid filesystem characters.
- Duplicate item names in the same export path are auto-numbered.

## AI Assistance Note

Portions of this project were developed with AI assistance, primarily for regex refinement and documentation drafting. All generated content was reviewed, edited, and validated before release.

## Acknowledgements

Special thanks to these open-source projects used by this module:

- [Turndown](https://github.com/mixmark-io/turndown) for HTML-to-Markdown conversion.
- [fflate](https://github.com/101arrowz/fflate) for in-browser ZIP creation.

## License

MIT. See [LICENSE](LICENSE).
