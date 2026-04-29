import {
	EXCLUDED_TRAITS,
	MODULE_ID,
	SETTINGS,
} from "./Constants.js";
import { downloadZip, getUniqueMarkdownBaseName } from "./Export-Utils.js";
import { applyRemasterChange, getBaseTraitKey } from "./PF2E-Text-Utils.js";
import { strToU8, zipSync } from "../vendor/fflate.browser.js";

function localizeExporter(key) {
	return game.i18n.localize(`FVTT_PF2EOBSIDIANEXPORTER.${key}`);
}

function formatExporter(key, data) {
	return game.i18n.format(`FVTT_PF2EOBSIDIANEXPORTER.${key}`, data);
}

function notifyExportFailure(key, data, error) {
	console.error(`${MODULE_ID} | Export failed`, error);
	ui.notifications?.error(formatExporter(key, data));
}

// -------------------- Trait Normalization Helpers -------------------- //
/**
 * Converts a slug-like trait key into PascalCase for PF2E localization keys.
 * @param {string} value The slug or trait key.
 * @returns {string} PascalCase text suitable for localization-key assembly.
 */
function toPascalCase(value) {
	return String(value ?? "")
		.trim()
		.split(/[_-\s]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

/**
 * Resolves a localization key against loaded and fallback translation stores.
 * @param {string} key The localization key to resolve.
 * @returns {string} The resolved localized text, or an empty string when unresolved.
 */
function resolveLocalizationKey(key) {
	const normalizedKey = String(key ?? "").trim();
	if (!normalizedKey) return "";

	const directTranslation = foundry.utils.getProperty(game.i18n.translations, normalizedKey);
	if (typeof directTranslation === "string" && directTranslation !== normalizedKey) return directTranslation;

	const fallbackTranslation = foundry.utils.getProperty(game.i18n._fallback, normalizedKey);
	if (typeof fallbackTranslation === "string" && fallbackTranslation !== normalizedKey) return fallbackTranslation;

	const localized = game.i18n.localize(normalizedKey);
	return localized !== normalizedKey ? localized : "";
}

/**
 * Resolves the best available localized description text for a trait.
 * Supports both direct translation keys in `CONFIG.PF2E.traitsDescriptions`
 * and derived PF2E trait-description localization key patterns.
 * @param {string} traitKey The raw PF2E trait key.
 * @param {string} description The raw description or localization key.
 * @returns {string} The localized description text, or the original value when unresolved.
 */
function localizeTraitDescription(traitKey, description) {
	const rawDescription = String(description ?? "").trim();
	if (!rawDescription) return "";

	const normalizedTraitKey = getBaseTraitKey(traitKey);
	const traitName = toPascalCase(normalizedTraitKey);
	const candidateKeys = [
		rawDescription,
		rawDescription.startsWith("PF2E.") ? rawDescription.slice(5) : `PF2E.${rawDescription}`,
		`PF2E.TraitDescription${traitName}`,
		`TraitDescription${traitName}`,
	];

	for (const candidateKey of candidateKeys) {
		const resolved = resolveLocalizationKey(candidateKey);
		if (resolved) return resolved;
	}

	return rawDescription;
}

/**
 * Formats a trait key into a human-readable title for markdown filenames and headings.
 * @param {string} traitKey The normalized trait key.
 * @returns {string} The formatted display name.
 */
function formatTraitName(traitKey) {
	return applyRemasterChange(traitKey)
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Builds a synthetic trait document used as the Handlebars render context.
 * This is intentionally item-like in shape where useful, but traits are not real Items.
 * @param {string} traitKey The PF2E trait key.
 * @param {string} description The localized trait description.
 * @returns {object} A synthetic trait document for template rendering.
 */
function buildTraitDocument(traitKey, description) {
	const normalizedKey = getBaseTraitKey(traitKey);
	return {
		name: formatTraitName(normalizedKey),
		type: "trait",
		slug: normalizedKey,
		system: {
			description: {
				value: localizeTraitDescription(normalizedKey, description),
			},
		},
	};
}

/**
 * Collects and deduplicates PF2E trait descriptions from runtime config.
 * Variant trait keys are normalized to a shared base key, preferring the longest
 * resolved description when multiple variants collapse to the same export target.
 * @returns {object[]} Synthetic trait documents ready for rendering.
 */
function getTraitDocuments() {
	const descriptions = globalThis.CONFIG?.PF2E?.traitsDescriptions ?? {};
	const dedupedDescriptions = new Map();

	for (const [traitKey, description] of Object.entries(descriptions)) {
		const baseTraitKey = getBaseTraitKey(traitKey);
		if (EXCLUDED_TRAITS.has(baseTraitKey)) continue;

		const localizedDescription = localizeTraitDescription(traitKey, description);
		if (!localizedDescription) continue;

		const existingDescription = dedupedDescriptions.get(baseTraitKey) ?? "";

		if (!existingDescription || localizedDescription.length > existingDescription.length) {
			dedupedDescriptions.set(baseTraitKey, localizedDescription);
		}
	}

	return Array.from(dedupedDescriptions.entries()).map(([traitKey, description]) =>
		buildTraitDocument(traitKey, description),
	);
}

// -------------------- Rendering and Export -------------------- //
/**
 * Renders a single trait into markdown using the configured Handlebars template.
 * @param {object} trait The synthetic trait document to render.
 * @returns {Promise<string>} Rendered markdown or a fallback error message.
 */
async function renderTraitMarkdown(trait) {
	const templatePath = game.settings.get(MODULE_ID, SETTINGS.TRAITS_TEMPLATE);

	try {
		return await foundry.applications.handlebars.renderTemplate(templatePath, trait);
	} catch (error) {
		console.error(`${MODULE_ID} | Failed to render template "${templatePath}" for trait "${trait.name}"`, error);
		return formatExporter("EXPORT.MARKDOWN.TRAIT-RENDER-FAILED", {
			traitName: trait.name,
			templatePath,
			error: String(error),
		});
	}
}

/**
 * Exports all configured PF2E traits as markdown files in a ZIP archive.
 * @returns {Promise<void>}
 */
export async function exportTraitsAsZip() {
	try {
		const traits = getTraitDocuments();
		if (!traits.length) {
			ui.notifications?.warn(localizeExporter("NOTIFICATIONS.TRAITS-NOT-FOUND"));
			return;
		}

		const renderedTraits = await Promise.all(
			traits.map(async (trait) => ({
				trait,
				markdown: await renderTraitMarkdown(trait),
			})),
		);

		const usedNames = new Set();
		const zipEntries = {};
		for (const { trait, markdown } of renderedTraits) {
			const baseName = getUniqueMarkdownBaseName(trait.name, usedNames);
			zipEntries[`Traits/${baseName}.md`] = strToU8(markdown);
		}

		const zipBytes = zipSync(zipEntries, { level: 6 });
		downloadZip("Traits", zipBytes);
		ui.notifications?.info(formatExporter("NOTIFICATIONS.TRAITS-EXPORTED", { count: traits.length }));
	} catch (error) {
		notifyExportFailure("NOTIFICATIONS.TRAITS-EXPORT-FAILED", {}, error);
	}
}

// -------------------- Trait Export Settings Menu -------------------- //
/**
 * Simple settings menu used to trigger a full trait export and show the active template path.
 */
export class TraitExportMenu extends foundry.applications.api.HandlebarsApplicationMixin(
	foundry.applications.api.ApplicationV2,
) {
	static DEFAULT_OPTIONS = {
		id: `${MODULE_ID}-trait-export-menu`,
		tag: "form",
		position: {
			width: 420,
		},
		window: {
			icon: "fas fa-file-export",
			title: "FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.EXPORT-TRAITS.TITLE",
			contentClasses: ["standard-form"],
		},
		actions: {
			exportTraits: this.#onExportTraits,
		},
		form: {
			closeOnSubmit: false,
		},
	};

	static PARTS = {
		main: {
			template: "modules/FVTT-PF2E-Obsidian-Exporter/src/templates/TraitExportMenu.hbs",
			root: true,
		},
	};

	get title() {
		return game.i18n.localize("FVTT_PF2EOBSIDIANEXPORTER.SETTINGS.EXPORT-TRAITS.TITLE");
	}

	/**
	 * Provides the current trait template path for display in the menu.
	 * @returns {Promise<{ traitTemplatePath: string }>} Template data for the menu.
	 */
	async _prepareContext() {
		return {
			traitTemplatePath: game.settings.get(MODULE_ID, SETTINGS.TRAITS_TEMPLATE),
		};
	}

	/**
	 * Trigger a trait export from the application action map.
	 * @param {PointerEvent} event The click event that triggered the action.
	 * @param {HTMLButtonElement} target The clicked action target.
	 * @returns {Promise<void>}
	 */
	static async #onExportTraits(event, target) {
		event.preventDefault();
		target.disabled = true;

		try {
			await exportTraitsAsZip();
		} finally {
			target.disabled = false;
		}
	}
}
