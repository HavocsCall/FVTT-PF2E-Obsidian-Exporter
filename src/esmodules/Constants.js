export const MODULE_ID = "FVTT_PF2EObsidianExporter";

export const DEBUG = false;

export const SETTINGS = {
	ACTION_TEMPLATE: "actionTemplate",
	AMMO_TEMPLATE: "ammoTemplate",
	ANCESTRY_TEMPLATE: "ancestryTemplate",
	ARMOR_TEMPLATE: "armorTemplate",
	BACKGROUND_TEMPLATE: "backgroundTemplate",
	CLASS_TEMPLATE: "classTemplate",
	CONDITION_TEMPLATE: "conditionTemplate",
	CONSUMABLE_TEMPLATE: "consumableTemplate",
	CONTAINER_TEMPLATE: "containerTemplate",
	DEITY_TEMPLATE: "deityTemplate",
	EQUIPMENT_TEMPLATE: "equipmentTemplate",
	FEAT_TEMPLATE: "featTemplate",
	HERITAGE_TEMPLATE: "heritageTemplate",
	SHIELD_TEMPLATE: "shieldTemplate",
	SPELL_TEMPLATE: "spellTemplate",
	TREASURE_TEMPLATE: "treasureTemplate",
	WEAPON_TEMPLATE: "weaponTemplate",
	EXPORT_TRAITS: "exportTraits",
	TRAITS_TEMPLATE: "traitTemplate",
};

export const ITEM_TEMPLATE_SETTINGS = [
	{ itemType: "action", settingKey: SETTINGS.ACTION_TEMPLATE, settingId: "ACTION-TEMPLATE", templateName: "Action" },
	{ itemType: "ammo", settingKey: SETTINGS.AMMO_TEMPLATE, settingId: "AMMO-TEMPLATE", templateName: "Ammo" },
	{
		itemType: "ancestry",
		settingKey: SETTINGS.ANCESTRY_TEMPLATE,
		settingId: "ANCESTRY-TEMPLATE",
		templateName: "Ancestry",
	},
	{ itemType: "armor", settingKey: SETTINGS.ARMOR_TEMPLATE, settingId: "ARMOR-TEMPLATE", templateName: "Armor" },
	{
		itemType: "background",
		settingKey: SETTINGS.BACKGROUND_TEMPLATE,
		settingId: "BACKGROUND-TEMPLATE",
		templateName: "Background",
	},
	{ itemType: "class", settingKey: SETTINGS.CLASS_TEMPLATE, settingId: "CLASS-TEMPLATE", templateName: "Class" },
	{
		itemType: "condition",
		settingKey: SETTINGS.CONDITION_TEMPLATE,
		settingId: "CONDITION-TEMPLATE",
		templateName: "Condition",
	},
	{
		itemType: "consumable",
		settingKey: SETTINGS.CONSUMABLE_TEMPLATE,
		settingId: "CONSUMABLE-TEMPLATE",
		templateName: "Consumable",
	},
	{
		itemType: "container",
		settingKey: SETTINGS.CONTAINER_TEMPLATE,
		settingId: "CONTAINER-TEMPLATE",
		templateName: "Container",
	},
	{ itemType: "deity", settingKey: SETTINGS.DEITY_TEMPLATE, settingId: "DEITY-TEMPLATE", templateName: "Deity" },
	{
		itemType: "equipment",
		settingKey: SETTINGS.EQUIPMENT_TEMPLATE,
		settingId: "EQUIPMENT-TEMPLATE",
		templateName: "Equipment",
	},
	{ itemType: "feat", settingKey: SETTINGS.FEAT_TEMPLATE, settingId: "FEAT-TEMPLATE", templateName: "Feat" },
	{
		itemType: "heritage",
		settingKey: SETTINGS.HERITAGE_TEMPLATE,
		settingId: "HERITAGE-TEMPLATE",
		templateName: "Heritage",
	},
	{ itemType: "shield", settingKey: SETTINGS.SHIELD_TEMPLATE, settingId: "SHIELD-TEMPLATE", templateName: "Shield" },
	{ itemType: "spell", settingKey: SETTINGS.SPELL_TEMPLATE, settingId: "SPELL-TEMPLATE", templateName: "Spell" },
	{
		itemType: "treasure",
		settingKey: SETTINGS.TREASURE_TEMPLATE,
		settingId: "TREASURE-TEMPLATE",
		templateName: "Treasure",
	},
	{ itemType: "weapon", settingKey: SETTINGS.WEAPON_TEMPLATE, settingId: "WEAPON-TEMPLATE", templateName: "Weapon" },
];

export const CONDITIONS = new Set([
	"blinded",
	"broken",
	"clumsy",
	"concealed",
	"confused",
	"controlled",
	"dazzled",
	"deafened",
	"doomed",
	"drained",
	"dying",
	"encumbered",
	"enfeebled",
	"fascinated",
	"fatigued",
	"fleeing",
	"frightened",
	"grabbed",
	"hidden",
	"immobilized",
	"invisible",
	"off-guard",
	"paralyzed",
	"persistent damage",
	"petrified",
	"prone",
	"quickened",
	"restrained",
	"sickened",
	"slowed",
	"stunned",
	"stupefied",
	"unconscious",
	"undetected",
	"wounded",
]);

export const VALUED_CONDITIONS = new Set([
	"clumsy",
	"doomed",
	"drained",
	"dying",
	"enfeebled",
	"frightened",
	"sickened",
	"slowed",
	"stunned",
	"stupefied",
	"wounded",
]);

export const ABILITY_LABELS = {
	str: "Strength",
	dex: "Dexterity",
	con: "Constitution",
	int: "Intelligence",
	wis: "Wisdom",
	cha: "Charisma",
};

export const ALL_ABILITY_KEYS = Object.keys(ABILITY_LABELS);

export const USAGE_LABELS = {
	"affixed-to-a-metal-weapon": "Affixed to a Metal Weapon",
	"affixed-to-a-shield": "Affixed to a Shield",
	"affixed-to-armor-or-travelers-clothing": "Affixed to Armor or Travelers Clothing",
	"affixed-to-firearm": "Affixed to Firearm",
	"attached-to-crossbow-or-firearm-firing-mechanism": "Attached to Crossbow or Firearm Firing Mechanism",
	"attached-to-ships-bow": "Attached to Ships Bow",
	"etched-onto-armor": "Etched onto Armor",
	"etched-onto-heavy-armor": "Etched onto Heavy Armor",
	"held-in-one-hand": "Held in 1 Hand",
	"held-in-one-plus-hands": "Held in 1 or 2 Hands",
	"held-in-two-hands": "Held in 2 Hands",
	"other": "Other",
	"worn": "Worn",
	"worncloak": "Worn Cloak",
	"worngarment": "Worn Garment",
	"wornhorseshoes": "Worn Horse Shoes",
};

export const REMASTER_CHANGES = {
	"aasimar": "nephilim",
	"gnoll": "kholo",
};

export const TRAIT_FAMILY_NORMALIZERS = [
	[/^area-.+$/i, "area"],
	[/^attached-to-.+$/i, "attached"],
	[/^critical-.+$/i, "critical-fusion"],
	[/^deflecting-.+$/i, "deflecting"],
	[/^entrench-.+$/i, "entrench"],
	[/^integrated-.+$/i, "integrated"],
	[/^launching-.+$/i, "launching"],
	[/^reload-.+$/i, "reload"],
];

export const EXCLUDED_TRAITS = new Set([
	"abjuration",
	"conjuration",
	"divination",
	"enchantment",
	"evocation",
	"illusion",
	"necromancy",
	"transmutation",
]);
