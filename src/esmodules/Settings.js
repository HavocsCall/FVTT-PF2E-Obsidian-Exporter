import { ITEM_TEMPLATE_SETTINGS, MODULE_ID, SETTINGS } from "./Constants.js";
import { TraitExportMenu } from "./Traits.js";

function getItemTemplatePath(templateName) {
	return `modules/${MODULE_ID}/src/handlebars/Items/${templateName}.hbs`;
}

export function registerModuleSettings() {
	game.settings.registerMenu(MODULE_ID, SETTINGS.EXPORT_TRAITS, {
		name: game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.EXPORT-TRAITS.NAME"),
		label: game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.EXPORT-TRAITS.LABEL"),
		hint: game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.EXPORT-TRAITS.HINT"),
		icon: "fas fa-file-export",
		type: TraitExportMenu,
		restricted: false,
	});

	for (const { settingKey, settingId, templateName } of ITEM_TEMPLATE_SETTINGS) {
		game.settings.register(MODULE_ID, settingKey, {
			name: game.i18n.localize(`FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.${settingId}.NAME`),
			hint: game.i18n.localize(`FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.${settingId}.HINT`),
			scope: "client",
			config: true,
			type: String,
			default: getItemTemplatePath(templateName),
		});
	}

	game.settings.register(MODULE_ID, SETTINGS.TRAITS_TEMPLATE, {
		name: game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.TRAIT-TEMPLATE.NAME"),
		hint: game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.TRAIT-TEMPLATE.HINT"),
		scope: "client",
		config: true,
		type: String,
		default: "modules/FVTT-PF2E-Obsidian-Exporter/src/handlebars/Trait.hbs",
	});
}
