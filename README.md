# PF2E Obsidian Exporter

A Foundry VTT module for Pathfinder 2e that exports PF2E items and trait descriptions to Markdown files designed for Obsidian workflows.

## Features

- Adds `Export as Markdown` to:
  - Individual PF2E Items
  - Item folders (recursive)
  - Item compendium packs (recursive)
- Exports a single item as one `.md` file.
- Exports folders/compendiums as a `.zip` containing one Markdown file per item.
- Exports PF2E trait descriptions as a `.zip` containing one Markdown file per trait.
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
- Includes a default Handlebars template for trait exports.
- Lets you override template paths per item type in module settings.

## Requirements

- Foundry VTT v13+
- Pathfinder 2e (`pf2e`) game system

## Installation

Install like any other Foundry module:

1. Open Foundry VTT.
2. Go to `Add-on Modules`.
3. Install using this Manifest URL `https://github.com/HavocsCall/FVTT_Pf2eObsidianExporter/releases/latest/download/module.json`.
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

### Export trait descriptions

1. Open `Game Settings -> Configure Settings -> Module Settings`.
2. Open the **Trait Export** menu for **PF2E Obsidian Exporter**.
3. Click `Export Traits`.
4. A `.zip` file is downloaded with one Markdown file per exported trait.

## Configuration

Go to `Game Settings -> Configure Settings -> Module Settings -> PF2E Obsidian Exporter`.

Each supported item type has a template path setting. By default, item templates point to:

`modules/FVTT_Pf2eObsidianExporter/src/handlebars/Items/*.hbs`

Trait exports use:

`modules/FVTT_Pf2eObsidianExporter/src/handlebars/Trait.hbs`

You can replace these with your own Handlebars templates to match your Obsidian vault conventions.

## Handlebars Helpers

The module registers the following helpers for use in custom templates.

| Helper | Purpose | Example |
| --- | --- | --- |
| `md-capitalize` | Uppercases the first character and normalizes slug separators like `-` and `_` to spaces. | `{{md-capitalize system.group}}` |
| `md-titleCase` | Converts text to title case and normalizes slug separators. | `{{md-titleCase system.damage.damageType}}` |
| `md-ability` | Formats PF2E ability keys or ability arrays. Full six-ability choices become `Free`. | `{{md-ability system.keyAbility.value}}` |
| `md-list` | Collects multiple values into an array, usually for use with `md-unique`. | `{{md-list (md-ability a) (md-ability b)}}` |
| `md-unique` | Removes duplicate entries from an array while preserving order. | `{{#each (md-unique (md-list "Free" "Free"))}}...{{/each}}` |
| `md-coinLabel` | Formats PF2E price/coin data into readable text. | `{{md-coinLabel system.price.value}}` |
| `md-usage` | Maps PF2E usage keys to readable labels. | `{{md-usage system.usage.value}}` |
| `md-trait` | Formats trait keys as Obsidian wiki-links. | `{{md-trait this}}` |
| `md-yamlText` | Escapes and quotes text for safe YAML frontmatter output. | `Source: {{md-yamlText system.publication.title}}` |
| `md-actionLabel` | Produces a readable action label such as `Reaction`, `Free`, or `2`. | `{{md-actionLabel system.actionType.value system.actions.value}}` |
| `md-actionCode` | Produces the compact PF2 action code such as `r`, `0`, `1`, `2`, or `3`. | `{{md-actionCode system.actionType.value system.actions.value}}` |
| `md-map` | Maps one value to another using hash arguments. | `{{md-map system.size sm="Small" med="Medium"}}` |
| `md-contains` | Checks whether a collection contains a value. | `{{#if (md-contains system.traits.value "attack")}}...{{/if}}` |
| `md-HTMLtoMarkdown` | Converts HTML-rich item text into normalized Markdown. | `{{md-HTMLtoMarkdown system.description.value}}` |

## Notes

- Export actions appear for all items, but template support is defined per item type.
- If an item type has no configured template, export still succeeds with a fallback Markdown message.
- Filenames are sanitized to avoid invalid filesystem characters.
- Duplicate item names in the same export path are auto-numbered.
- Some PF2E trait families are normalized and deduplicated during trait export.

## Development

- Install dependencies with `npm ci`
- Run lint checks with `npm run lint`
- Run the normalization test suite with `npm test`

## AI Assistance Note

Portions of this project were developed with AI assistance, primarily for regex refinement and documentation drafting. All generated content was reviewed, edited, and validated before release.

## Acknowledgements

Special thanks to these open-source projects used by this module:

- [Turndown](https://github.com/mixmark-io/turndown) for HTML-to-Markdown conversion.
- [fflate](https://github.com/101arrowz/fflate) for in-browser ZIP creation.

## License

MIT. See [LICENSE](LICENSE).

