import assert from "node:assert/strict";

import {
	applyRemasterChange,
	formatActionCode,
	formatActionLabel,
	formatTrait,
	getBaseTraitKey,
	normalizeFoundryInlineRolls,
	normalizeFoundryLinks,
	removeStandalonePf2eUuidLinks,
} from "../src/esmodules/Obsidian-Exporter.PF2E-Text-Utils.js";

function runTest(name, fn) {
	try {
		fn();
		console.log(`PASS ${name}`);
	} catch (error) {
		console.error(`FAIL ${name}`);
		throw error;
	}
}

runTest("normalizeFoundryLinks rewrites condition UUID links and preserves valued suffixes", () => {
	const input = "@UUID[Compendium.pf2e.conditionitems.Item.abc123]{Frightened 2}";
	assert.equal(normalizeFoundryLinks(input), "[[Frightened]] 2");
});

runTest("normalizeFoundryLinks rewrites bracket links into Obsidian wiki-links", () => {
	const input = "[[Compendium.pf2e.feats-srd.Item.xyz789]]{Sudden Charge}";
	assert.equal(normalizeFoundryLinks(input), "[[Sudden Charge]]");
});

runTest("normalizeFoundryLinks aliases non-condition PF2E condition links to Persistent Damage", () => {
	const input = "@UUID[Compendium.pf2e.conditionitems.Item.damage]{1d6 fire}";
	assert.equal(normalizeFoundryLinks(input), "[[Persistent Damage|1d6 fire]]");
});

runTest("removeStandalonePf2eUuidLinks removes standalone PF2E macro lines and compacts blank lines", () => {
	const input = ["Before", "", "@UUID[Compendium.pf2e.pf2e-macros.Macro.abc]{Click Me}", "", "After"].join("\n");
	assert.equal(removeStandalonePf2eUuidLinks(input), ["Before", "", "After"].join("\n"));
});

runTest("normalizeFoundryInlineRolls strips inline roll syntax down to the formula token", () => {
	const input = "Damage [[/r 1d6[fire]]] plus [[/r 2d4[persistent,fire]]]";
	assert.equal(normalizeFoundryInlineRolls(input), "Damage 1d6 plus 2d4");
});

runTest("formatTrait handles remaster renames and valued trait variants", () => {
	assert.equal(formatTrait("gnoll"), "[[Kholo]]");
	assert.equal(formatTrait("versatile-b"), "[[Versatile|Versatile B]]");
	assert.equal(formatTrait("fatal-d12"), "[[Fatal|Fatal d12]]");
});

runTest("formatActionLabel handles reaction, free, numeric, and ranged values", () => {
	assert.equal(formatActionLabel("reaction", null), "Reaction");
	assert.equal(formatActionLabel("free", null), "Free");
	assert.equal(formatActionLabel(null, 2), "2");
	assert.equal(formatActionLabel("1 to 3 actions", null), "1 to 3 Actions");
});

runTest("formatActionCode handles reaction, free, numeric, and ranged values", () => {
	assert.equal(formatActionCode("reaction", null), "r");
	assert.equal(formatActionCode("free", null), "0");
	assert.equal(formatActionCode(null, 3), "3");
	assert.equal(formatActionCode("1-3 actions", null), "1");
});

runTest("applyRemasterChange handles remastered trait names", () => {
	assert.equal(applyRemasterChange("gnoll"), "kholo");
	assert.equal(applyRemasterChange("aasimar"), "nephilim");
});

runTest("getBaseTraitKey normalizes valued traits and family variants", () => {
	assert.equal(getBaseTraitKey("fatal-d12"), "fatal");
	assert.equal(getBaseTraitKey("attached-to-crossbow"), "attached");
	assert.equal(getBaseTraitKey("area-15-foot-cone"), "area");
	assert.equal(getBaseTraitKey("launching-greater"), "launching");
});
