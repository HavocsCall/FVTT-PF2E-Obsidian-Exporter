import TurndownService from "../vendor/turndown.browser.es.js";
import {
	ABILITY_LABELS,
	ALL_ABILITY_KEYS,
	PF2E_CONDITIONS,
	PF2E_VALUED_CONDITIONS,
	USAGE_LABELS,
} from "./Obsidian-Exporter.Constants.js";

// -------------------- Shared String Helpers -------------------- //
/**
 * Decodes HTML entities, repeating until stable or max passes are reached.
 * @param {string} value The source text that may contain HTML entities.
 * @param {number} [maxPasses=3] Maximum decoding passes to run.
 * @returns {string} Decoded string value.
 */
function decodeHtmlEntities(value, maxPasses = 3) {
	let current = String(value ?? "");

	for (let i = 0; i < maxPasses; i += 1) {
		const textarea = document.createElement("textarea");
		textarea.innerHTML = current;
		const decoded = textarea.value;
		if (decoded === current) break;
		current = decoded;
	}

	return current;
}

/**
 * Converts a string to title case by capitalizing each whitespace-separated word.
 * @param {string} value Input text.
 * @returns {string} Title-cased string.
 */
function toTitleCase(value) {
	return String(value ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Capitalizes the first character of a value, returning an empty string for nullish input.
 * @param {string} value Input text.
 * @returns {string} Capitalized string or empty string when input is nullish/empty.
 */
function safeCapitalize(value) {
	const normalized = String(value ?? "").trim();
	if (!normalized) return "";
	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Normalizes a condition key for matching against PF2E condition sets.
 * @param {string} value Raw condition label or key.
 * @returns {string} Lowercased, whitespace-normalized condition key.
 */
function normalizeConditionKey(value) {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[\u2013\u2014]/g, "-")
		.replace(/\s+/g, " ");
}

// -------------------- Foundry Link and Roll Normalization -------------------- //
/**
 * Formats a Foundry link label into Obsidian wiki-link style.
 * @param {string} label Display label from a Foundry macro/link.
 * @returns {string} Obsidian-formatted link label, preserving valued condition suffixes.
 */
function formatFoundryLinkLabel(label) {
	const trimmedLabel = String(label ?? "").trim();
	const valuedMatch = trimmedLabel.match(/^(.+?)\s+(\d+)$/);

	if (valuedMatch) {
		const conditionName = valuedMatch[1].trim();
		const conditionValue = valuedMatch[2];
		const conditionKey = normalizeConditionKey(conditionName);
		if (PF2E_VALUED_CONDITIONS.has(conditionKey)) return `[[${conditionName}]] ${conditionValue}`;
	}

	return `[[${trimmedLabel}]]`;
}

/**
 * Formats a PF2E condition compendium label into Obsidian wiki-link style.
 * @param {string} label Display label from a condition compendium link.
 * @returns {string} Obsidian-formatted condition link.
 */
function formatConditionCompendiumLabel(label) {
	const trimmedLabel = String(label ?? "").trim();
	const valuedMatch = trimmedLabel.match(/^(.+?)\s+(\d+)$/);

	if (valuedMatch) {
		const conditionName = valuedMatch[1].trim();
		const conditionValue = valuedMatch[2];
		const conditionKey = normalizeConditionKey(conditionName);
		if (PF2E_VALUED_CONDITIONS.has(conditionKey)) return `[[${conditionName}]] ${conditionValue}`;
	}

	const conditionKey = normalizeConditionKey(trimmedLabel);
	if (PF2E_CONDITIONS.has(conditionKey)) return `[[${trimmedLabel}]]`;
	return `[[Persistent Damage|${trimmedLabel}]]`;
}

/**
 * Converts Foundry @UUID macro links into Obsidian-style links.
 * @param {string} value Markdown text that may contain @UUID links.
 * @returns {string} Text with UUID links normalized.
 */
function normalizeFoundryUuidMacroLinks(value) {
	return String(value ?? "").replace(
		/@UUID\\?\[([^\]]+)\\?\]\{([^}]+)\}/g,
		(_match, uuid, label) => {
			const uuidText = String(uuid ?? "").toLowerCase();
			if (uuidText.includes("compendium.pf2e.conditionitems.item.")) {
				return formatConditionCompendiumLabel(label);
			}
			return formatFoundryLinkLabel(label);
		},
	);
}

/**
 * Converts Foundry bracket-link macros into Obsidian-style links.
 * @param {string} value Markdown text that may contain Foundry bracket links.
 * @returns {string} Text with bracket links normalized.
 */
function normalizeFoundryBracketLinks(value) {
	return String(value ?? "").replace(
		/\\?\[\\?\[([^\]]+)\\?\]\\?\]\{([^}]+)\}/g,
		(_match, target, label) => {
			const targetText = String(target ?? "").toLowerCase();
			if (targetText.includes("compendium.pf2e.conditionitems.item.")) {
				return formatConditionCompendiumLabel(label);
			}
			return formatFoundryLinkLabel(label);
		},
	);
}

/**
 * Normalizes both UUID and bracket Foundry links into Obsidian-style links.
 * @param {string} value Markdown text that may contain Foundry links.
 * @returns {string} Text with supported Foundry links normalized.
 */
function normalizeFoundryLinks(value) {
	const uuidNormalized = normalizeFoundryUuidMacroLinks(value);
	return normalizeFoundryBracketLinks(uuidNormalized);
}

/**
 * Removes standalone PF2E UUID utility lines from markdown text.
 * @param {string} value Markdown text to clean.
 * @returns {string} Markdown without standalone utility link lines.
 */
function removeStandalonePf2eUuidLinks(value) {
	return String(value ?? "")
		.replace(
			/^[ \t]*(?:[-*+]\s+|>\s*)?(?:[*_]{1,3}\s*)?@UUID\\?\[[^\]]*compendium\.pf2e\.pf2e-macros\.macro\.[^\]]+\\?\]\{[^}]+\}(?:\s*[*_]{1,3})?[ \t]*$/gim,
			"",
		)
		.replace(
			/^[ \t]*(?:[-*+]\s+|>\s*)?(?:[*_]{1,3}\s*)?@UUID\\?\[[^\]]*compendium\.pf2e\.other-effects\.item\.[^\]]+\\?\]\{[^}]+\}(?:\s*[*_]{1,3})?[ \t]*$/gim,
			"",
		)
		.replace(
			/^[ \t]*(?:[-*+]\s+|>\s*)?(?:[*_]{1,3}\s*)?@UUID\\?\[[^\]]*compendium\.pf2e\.journals\.[^\]]+\\?\]\{[^}]+\}(?:\s*[*_]{1,3})?[ \t]*$/gim,
			"",
		)
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/**
 * Rewrites Foundry inline roll syntax to plain roll formulas.
 * @param {string} value Markdown text that may include inline rolls.
 * @returns {string} Text with inline rolls simplified.
 */
function normalizeFoundryInlineRolls(value) {
	return String(value ?? "").replace(
		/\\?\[\\?\[\/r\s+([\s\S]*?)\\?\]\\?\]/g,
		(_match, rollCommand) => {
			const cleanedCommand = String(rollCommand).replace(/\\(\[|\])/g, "$1").trim();
			const formulaToken = cleanedCommand.split(/\s+/)[0] ?? "";
			return formulaToken.replace(/\[.*$/, "");
		},
	);
}

// -------------------- PF2E Value Formatters -------------------- //
/**
 * Formats ability keys into readable labels and recognizes "all abilities" as Free.
 * @param {string} value Ability key or comma-delimited ability key list.
 * @returns {string} Display-friendly ability label.
 */
function formatAbility(value) {
	const raw = String(value ?? "").trim().toLowerCase();
	if (!raw) return "";

	if (ABILITY_LABELS[raw]) return ABILITY_LABELS[raw];

	const parts = raw
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length === ALL_ABILITY_KEYS.length && ALL_ABILITY_KEYS.every((key) => parts.includes(key))) {
		return "Free";
	}

	return value ?? "";
}

/**
 * Formats coin data into a consistent label.
 * @param {string} value Coin value as string, number, or denomination object.
 * @returns {string} Formatted coin label.
 */
function formatCoinLabel(value) {
	if (value == null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return `${value} gp`;

	if (typeof value === "object") {
		if ("value" in value) return formatCoinLabel(value.value);

		const parts = [];
		for (const denomination of ["pp", "gp", "sp", "cp"]) {
			const amount = Number(value[denomination] ?? 0);
			if (!Number.isFinite(amount) || amount === 0) continue;
			parts.push(`${amount} ${denomination}`);
		}

		return parts.join(", ");
	}

	return String(value);
}

/**
 * Maps PF2E usage keys to friendly labels.
 * @param {string} value Raw usage key.
 * @returns {string} Friendly usage label.
 */
function formatUsage(value) {
	const key = String(value ?? "").trim().toLowerCase();
	if (!key) return "";
	return USAGE_LABELS[key] ?? value ?? "";
}

/**
 * Formats trait keys into Obsidian wiki-links, including valued trait variants.
 * @param {string} value Raw trait key.
 * @returns {string} Obsidian-formatted trait link.
 */
function formatTrait(value) {
	const raw = String(value ?? "").trim().toLowerCase();
	if (!raw) return "";

	const normalized = raw.replace(/_/g, "-");
	const valuedMatch = normalized.match(/^(.+)-(\d+|d\d+|[a-z])$/i);

	if (valuedMatch) {
		const baseKey = valuedMatch[1];
		const suffixRaw = valuedMatch[2];
		const baseLabel = toTitleCase(baseKey.replace(/-/g, " "));
		const suffixLabel = /^[a-z]$/i.test(suffixRaw) ? suffixRaw.toUpperCase() : suffixRaw.toLowerCase();
		return `[[${baseLabel}|${baseLabel} ${suffixLabel}]]`;
	}

	return `[[${toTitleCase(normalized.replace(/-/g, " "))}]]`;
}

/**
 * Produces a YAML-safe quoted text value from rich/html content.
 * @param {string} value Source content that may contain HTML/entities.
 * @returns {string} Escaped, quoted YAML-safe text.
 */
function formatYamlText(value) {
	const decoded = decodeHtmlEntities(value);
	const parsed = new DOMParser().parseFromString(`<div>${decoded}</div>`, "text/html");
	const rawText = parsed.body.textContent ?? "";
	const withoutControlChars = Array.from(rawText, (char) => {
		const code = char.charCodeAt(0);
		const isForbiddenControl =
			(code >= 0 && code <= 8) || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;
		return isForbiddenControl ? "" : char;
	}).join("");
	const normalized = withoutControlChars.replace(/\s+/g, " ").trim();
	const escaped = normalized.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	return `"${escaped}"`;
}

// -------------------- Action Formatters -------------------- //
/**
 * Formats action fields into display labels like "Reaction", "Free", or numeric ranges.
 * @param {string} actionTypeValue Action type source value.
 * @param {number} actionsValue Action count source value.
 * @returns {string} Display action label.
 */
function formatActionLabel(actionTypeValue, actionsValue) {
	const actionType = String(actionTypeValue ?? "").trim().toLowerCase();
	const actionValue = String(actionsValue ?? "").trim().toLowerCase();

	const normalizeRangeText = (value) =>
		String(value ?? "")
			.toLowerCase()
			.replace(/\bactions?\b/g, "")
			.trim();

	const rangeValue = normalizeRangeText(actionType || actionValue);
	const rangeMatch = rangeValue.match(/^(\d+)\s*(?:to|-)\s*(\d+)$/);
	if (rangeMatch) return `${rangeMatch[1]} to ${rangeMatch[2]} Actions`;

	if (actionType === "reaction") return "Reaction";
	if (actionType === "free") return "Free";

	const actionCount = Number(actionsValue);
	if (Number.isInteger(actionCount) && actionCount >= 1 && actionCount <= 3) return String(actionCount);

	const actionTypeCount = Number(actionTypeValue);
	if (Number.isInteger(actionTypeCount) && actionTypeCount >= 1 && actionTypeCount <= 3) return String(actionTypeCount);

	return "";
}

/**
 * Formats action fields into compact action code values used by templates.
 * @param {string} actionTypeValue Action type source value.
 * @param {number} actionsValue Action count source value.
 * @returns {string} Compact action code.
 */
function formatActionCode(actionTypeValue, actionsValue) {
	const actionType = String(actionTypeValue ?? "").trim().toLowerCase();
	const actionValue = String(actionsValue ?? "").trim().toLowerCase();

	const normalizeRangeText = (value) =>
		String(value ?? "")
			.toLowerCase()
			.replace(/\bactions?\b/g, "")
			.trim();

	const rangeValue = normalizeRangeText(actionType || actionValue);
	const rangeMatch = rangeValue.match(/^(\d+)\s*(?:to|-)\s*(\d+)$/);
	if (rangeMatch) return rangeMatch[1];

	if (actionType === "reaction") return "r";
	if (actionType === "free") return "0";

	const actionCount = Number(actionsValue);
	if (Number.isInteger(actionCount) && actionCount >= 1 && actionCount <= 3) return String(actionCount);
	return "";
}

/**
 * Shared implementation for the `md-map` helper.
 * Maps an input value by checking helper hash key/value pairs.
 * @param {string} value Value to map.
 * @param {...any} args Handlebars helper arguments; last arg is options/hash.
 * @returns {string} Mapped value or original value when no mapping matches.
 */
const tableMapHelper = (value, ...args) => {
	const valueKey = String(value ?? "").trim().toLowerCase();
	if (!valueKey) return value ?? "";

	const options = args.at(-1);
	for (const [match, result] of Object.entries(options?.hash ?? {})) {
		const keys = String(match)
			.split(",")
			.map((entry) => entry.trim().toLowerCase())
			.filter(Boolean);
		if (keys.includes(valueKey)) return result;
	}

	return value ?? "";
};

/**
 * Checks whether a value exists within a collection.
 * Supports arrays/iterables, strings (substring match), maps/sets, and plain objects.
 * String matching is case-insensitive and trims surrounding whitespace.
 * @param {any} collection Collection to inspect.
 * @param {string} needle Value to find.
 * @returns {boolean} True when collection contains needle.
 */
function containsValue(collection, needle) {
	if (collection == null || needle == null) return false;

	const normalize = (value) => String(value ?? "").trim().toLowerCase();
	const normalizedNeedle = normalize(needle);
	if (!normalizedNeedle) return false;
	const needleIsStringLike = typeof needle === "string" || typeof needle === "number" || typeof needle === "boolean";
	const matches = (candidate) => {
		if (needleIsStringLike || typeof candidate === "string") return normalize(candidate) === normalizedNeedle;
		return candidate === needle;
	};

	if (Array.isArray(collection)) return collection.some((entry) => matches(entry));

	if (typeof collection === "string") return normalize(collection).includes(normalizedNeedle);

	if (collection instanceof Set) {
		for (const value of collection.values()) {
			if (matches(value)) return true;
		}
		return false;
	}

	if (collection instanceof Map) {
		for (const [key, value] of collection.entries()) {
			if (matches(key) || matches(value)) return true;
		}
		return false;
	}

	if (typeof collection === "object" && typeof collection.has === "function") {
		if (collection.has(needle) || collection.has(normalizedNeedle)) return true;
	}

	if (typeof collection === "object" && Symbol.iterator in collection) {
		for (const value of collection) {
			if (matches(value)) return true;
		}
		return false;
	}

	if (typeof collection === "object") {
		for (const [key, value] of Object.entries(collection)) {
			if (matches(key) || matches(value)) return true;
		}
		return false;
	}

	return false;
}

/**
 * Shared Turndown instance used by `md-HTMLtoMarkdown`.
 * Created once at module load to avoid re-instantiating on each helper call.
 */
const turndown = new TurndownService({
	bulletListMarker: "-",
	codeBlockStyle: "fenced",
	emDelimiter: "*",
	headingStyle: "atx",
});

// -------------------- Handlebars Registration -------------------- //
/**
 * Registers all custom Handlebars helpers used by exporter templates.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("capitalize", (value) => safeCapitalize(value));

	Handlebars.registerHelper("md-ability", (value) => formatAbility(value));

	Handlebars.registerHelper("md-coinLabel", (value) => formatCoinLabel(value));

	Handlebars.registerHelper("md-usage", (value) => formatUsage(value));

	Handlebars.registerHelper("md-trait", (value) => formatTrait(value));

	Handlebars.registerHelper("md-yamlText", (value) => new Handlebars.SafeString(formatYamlText(value)));

	Handlebars.registerHelper("md-actionLabel", (actionTypeValue, actionsValue) =>
		formatActionLabel(actionTypeValue, actionsValue),
	);
	
	Handlebars.registerHelper("md-actionCode", (actionTypeValue, actionsValue) =>
		formatActionCode(actionTypeValue, actionsValue),
	);

	Handlebars.registerHelper("md-map", tableMapHelper);

	Handlebars.registerHelper("md-contains", (collection, needle) => containsValue(collection, needle));

	// Backward compatibility alias for existing templates.
	Handlebars.registerHelper("md-traitsInclude", (traits, trait) => containsValue(traits, trait));

	Handlebars.registerHelper("md-HTMLtoMarkdown", (value) => {
		const html = String(value ?? "").trim();
		if (!html) return "";

		const markdown = turndown.turndown(html).trim();
		const macroCleaned = removeStandalonePf2eUuidLinks(markdown);
		const normalizedLinks = normalizeFoundryLinks(macroCleaned);
		const normalizedRolls = normalizeFoundryInlineRolls(normalizedLinks);
		const normalized = decodeHtmlEntities(normalizedRolls);
		return new Handlebars.SafeString(normalized);
	});
}
