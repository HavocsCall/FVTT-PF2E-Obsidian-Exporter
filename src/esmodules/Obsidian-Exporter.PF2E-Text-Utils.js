import { CONDITIONS, REMASTER_CHANGES, TRAIT_FAMILY_NORMALIZERS, VALUED_CONDITIONS } from "./Obsidian-Exporter.Constants.js";

function toTitleCase(value) {
	return String(value ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function applyRemasterChange(value) {
	const normalized = String(value ?? "").trim().toLowerCase();
	if (!normalized) return "";
	return REMASTER_CHANGES[normalized] ?? normalized;
}

export function normalizeConditionKey(value) {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[\u2013\u2014]/g, "-")
		.replace(/\s+/g, " ");
}

export function formatFoundryLinkLabel(label) {
	const trimmedLabel = String(label ?? "").trim();
	const valuedMatch = trimmedLabel.match(/^(.+?)\s+(\d+)$/);

	if (valuedMatch) {
		const conditionName = valuedMatch[1].trim();
		const conditionValue = valuedMatch[2];
		const conditionKey = normalizeConditionKey(conditionName);
		if (VALUED_CONDITIONS.has(conditionKey)) return `[[${conditionName}]] ${conditionValue}`;
	}

	return `[[${trimmedLabel}]]`;
}

export function formatConditionCompendiumLabel(label) {
	const trimmedLabel = String(label ?? "").trim();
	const valuedMatch = trimmedLabel.match(/^(.+?)\s+(\d+)$/);

	if (valuedMatch) {
		const conditionName = valuedMatch[1].trim();
		const conditionValue = valuedMatch[2];
		const conditionKey = normalizeConditionKey(conditionName);
		if (VALUED_CONDITIONS.has(conditionKey)) return `[[${conditionName}]] ${conditionValue}`;
	}

	const conditionKey = normalizeConditionKey(trimmedLabel);
	if (CONDITIONS.has(conditionKey)) return `[[${trimmedLabel}]]`;
	return `[[Persistent Damage|${trimmedLabel}]]`;
}

export function normalizeFoundryUuidMacroLinks(value) {
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

export function normalizeFoundryBracketLinks(value) {
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

export function normalizeFoundryLinks(value) {
	const uuidNormalized = normalizeFoundryUuidMacroLinks(value);
	return normalizeFoundryBracketLinks(uuidNormalized);
}

export function removeStandalonePf2eUuidLinks(value) {
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

export function normalizeFoundryInlineRolls(value) {
	return String(value ?? "").replace(
		/\\?\[\\?\[\/r\s+([\s\S]*?)\\?\](?:\\?\]){2}/g,
		(_match, rollCommand) => {
			const cleanedCommand = String(rollCommand).replace(/\\(\[|\])/g, "$1").trim();
			const formulaToken = cleanedCommand.split(/\s+/)[0] ?? "";
			return formulaToken.replace(/\[.*$/, "").replace(/\]+$/g, "");
		},
	);
}

export function formatTrait(value) {
	const raw = String(value ?? "").trim().toLowerCase();
	if (!raw) return "";

	const normalized = applyRemasterChange(raw);
	const valuedMatch = normalized.match(/^(.+)-(\d+|d\d+|[a-z])$/i);

	if (valuedMatch) {
		const baseKey = applyRemasterChange(valuedMatch[1]);
		const suffixRaw = valuedMatch[2];
		const baseLabel = toTitleCase(baseKey.replace(/-/g, " "));
		const suffixLabel = /^[a-z]$/i.test(suffixRaw) ? suffixRaw.toUpperCase() : suffixRaw.toLowerCase();
		return `[[${baseLabel}|${baseLabel} ${suffixLabel}]]`;
	}

	return `[[${toTitleCase(normalized.replace(/-/g, " "))}]]`;
}

export function formatActionLabel(actionTypeValue, actionsValue) {
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

export function formatActionCode(actionTypeValue, actionsValue) {
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

export function getBaseTraitKey(traitKey) {
	let normalized = applyRemasterChange(traitKey);
	const valuedSuffixPatterns = [
		/^(.+)-(\d+|\d+d\d+|d\d+|[a-z])$/i,
		/^(.+?)(\d+d\d+|d\d+|\d+)$/i,
	];

	while (true) {
		const valuedMatch = valuedSuffixPatterns
			.map((pattern) => normalized.match(pattern))
			.find(Boolean);
		if (!valuedMatch) break;
		normalized = applyRemasterChange(valuedMatch[1]);
	}

	for (const [pattern, replacement] of TRAIT_FAMILY_NORMALIZERS) {
		if (pattern.test(normalized)) return replacement;
	}

	return normalized;
}
