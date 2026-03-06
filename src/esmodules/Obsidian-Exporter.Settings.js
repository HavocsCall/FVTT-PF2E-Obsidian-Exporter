import { MODULE_ID, SETTINGS } from "./Obsidian-Exporter.Constants.js";

export function registerModuleSettings() {
    game.settings.register(MODULE_ID, SETTINGS.ACTION_TEMPLATE, {
        name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ACTION-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ACTION-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Action.hbs",
    });

	game.settings.register(MODULE_ID, SETTINGS.AMMO_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.AMMO-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.AMMO-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Ammo.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.ANCESTRY_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ANCESTRY-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ANCESTRY-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Ancestry.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.ARMOR_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ARMOR-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.ARMOR-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Armor.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.BACKGROUND_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.BACKGROUND-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.BACKGROUND-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Background.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.CLASS_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CLASS-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CLASS-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Class.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.CONDITION_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONDITION-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONDITION-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Condition.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.CONSUMABLE_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONSUMABLE-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONSUMABLE-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Consumable.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.CONTAINER_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONTAINER-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.CONTAINER-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Container.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.DEITY_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.DEITY-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.DEITY-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Deity.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.EQUIPMENT_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.EQUIPMENT-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.EQUIPMENT-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Equipment.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.FEAT_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.FEAT-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.FEAT-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Feat.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.HERITAGE_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.HERITAGE-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.HERITAGE-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Heritage.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.SHIELD_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.SHIELD-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.SHIELD-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Shield.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.SPELL_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.SPELL-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.SPELL-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Spell.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.TREASURE_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.TREASURE-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.TREASURE-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Treasure.hbs",
	});

	game.settings.register(MODULE_ID, SETTINGS.WEAPON_TEMPLATE, {
		name: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.WEAPON-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.SETTINGS.WEAPON-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/handlebars/Weapon.hbs",
	});
}
