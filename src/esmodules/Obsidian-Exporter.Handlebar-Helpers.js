import TurndownService from "../vendor/turndown.browser.es.js";
import { ABILITY_LABELS, ALL_ABILITY_KEYS, USAGE_LABELS } from "./Obsidian-Exporter.Constants.js";
import {
	formatActionCode,
	formatActionLabel,
	formatTrait,
	normalizeFoundryInlineRolls,
	normalizeFoundryLinks,
	removeStandalonePf2eUuidLinks,
} from "./Obsidian-Exporter.PF2E-Text-Utils.js";

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
 * Normalizes slug separators into plain spaces.
 * @param {string} value Input text.
 * @returns {string} Space-normalized string.
 */
function normalizeSlugText(value) {
	return String(value ?? "")
		.trim()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ");
}

/**
 * Capitalizes the first character of a value, returning an empty string for nullish input.
 * @param {string} value Input text.
 * @returns {string} Capitalized string or empty string when input is nullish/empty.
 */
function safeCapitalize(value) {
	const normalized = normalizeSlugText(value);
	if (!normalized) return "";
	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Converts a value to title case after normalizing slug separators.
 * @param {string} value Input text.
 * @returns {string} Title-cased string or empty string when input is nullish/empty.
 */
function safeTitleCase(value) {
	const normalized = normalizeSlugText(value);
	if (!normalized) return "";
	return toTitleCase(normalized);
}

// -------------------- PF2E Value Formatters -------------------- //
/**
 * Formats ability keys into readable labels and recognizes "all abilities" as Free.
 * @param {string} value Ability key or comma-delimited ability key list.
 * @returns {string} Display-friendly ability label.
 */
function formatAbility(value) {
	const normalizePart = (part) => String(part ?? "").trim().toLowerCase();
	const hasIterator = value != null && typeof value !== "string" && Symbol.iterator in Object(value);
	const rawParts = Array.isArray(value)
		? value
		: hasIterator
			? Array.from(value)
			: value && typeof value === "object"
				? Object.values(value)
				: String(value ?? "").trim().toLowerCase().split(",");
	const parts = [...new Set(rawParts.map((part) => normalizePart(part)).filter(Boolean))];
	if (parts.length === 0) return "";

	if (parts.length === 1 && ABILITY_LABELS[parts[0]]) return ABILITY_LABELS[parts[0]];

	if (parts.length === ALL_ABILITY_KEYS.length && ALL_ABILITY_KEYS.every((key) => parts.includes(key))) {
		return "Free";
	}

	const labels = parts.map((part) => ABILITY_LABELS[part] ?? part);
	return labels.join(", ");
}

/**
 * Removes duplicate values from an array while preserving order.
 * @param {any} value Input collection.
 * @returns {any[]} Deduplicated array.
 */
function uniqueList(value) {
	if (value == null) return [];
	const items = Array.isArray(value) ? value : [value];
	return [...new Set(items.filter((item) => String(item ?? "").trim() !== ""))];
}

/**
 * Collects helper arguments into an array, excluding the Handlebars options object.
 * @param {...any} args Values to collect.
 * @returns {any[]} Collected values.
 */
function collectList(...args) {
	return args.slice(0, -1);
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
	Handlebars.registerHelper("md-capitalize", (value) => safeCapitalize(value));

	Handlebars.registerHelper("md-titleCase", (value) => safeTitleCase(value));

	Handlebars.registerHelper("md-ability", (value) => formatAbility(value));

	Handlebars.registerHelper("md-list", (...args) => collectList(...args));
	
	Handlebars.registerHelper("md-unique", (value) => uniqueList(value));

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
