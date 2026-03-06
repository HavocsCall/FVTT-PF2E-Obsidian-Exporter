export const MODULE_ID = "FVTT-PF2E-Obsidian-Exporter";

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
    WEAPON_TEMPLATE: "weaponTemplate"
};

export const PF2E_CONDITIONS = new Set([
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
    "wounded"
]);

export const PF2E_VALUED_CONDITIONS = new Set([
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
    "wounded"
]);

export const ABILITY_LABELS = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma"
};

export const ALL_ABILITY_KEYS = Object.keys(ABILITY_LABELS);

export const USAGE_LABELS = {
    "held-in-one-plus-hands": "Held in 1 or 2 Hands",
    "other": "Other",
    "affixed-to-a-metal-weapon": "Affixed to a Metal Weapon",
    "wornhorseshoes": "Worn Horse Shoes",
    "attached-to-crossbow-or-firearm-firing-mechanism": "Attached to Crossbow or Firearm Firing Mechanism",
    "etched-onto-heavy-armor": "Etched onto Heavy Armor",
    "etched-onto-armor": "Etched onto Armor",
    "affixed-to-firearm": "Affixed to Firearm",
    "held-in-one-hand": "Held in 1 Hand",
    "held-in-two-hands": "Held in 2 Hands",
    "worn": "Worn",
    "affixed-to-armor-or-travelers-clothing": "Affixed to Armor or Travelers Clothing",
    "affixed-to-a-shield": "Affixed to a Shield",
    "attached-to-ships-bow": "Attached to Ships Bow",
    "worngarment": "Worn Garment",
    "worncloak": "Worn Cloak"
};
