import { ITEM_TEMPLATE_SETTINGS, MODULE_ID } from "./Obsidian-Exporter.Constants.js";
import { registerModuleSettings } from "./Obsidian-Exporter.Settings.js";
import { registerHandlebarsHelpers } from "./Obsidian-Exporter.Handlebar-Helpers.js";
import {
	downloadMarkdown,
	downloadZip,
	getUniqueMarkdownBaseName,
	sanitizeFileName,
} from "./Obsidian-Exporter.Export-Utils.js";
import { strToU8, zipSync } from "../vendor/fflate.browser.js";

// -------------------- Hooks -------------------- //
Hooks.once("init", () => {
	registerHandlebarsHelpers();
	registerModuleSettings();
});

Hooks.on("getItemContextOptions", (_html, menuItems) => {
	menuItems.push({
		name: "FVTT-PF2E-OBSIDIAN-EXPORTER.CONTEXT.EXPORT-MARKDOWN",
		icon: '<i class="fas fa-file-export"></i>',
		condition: () => true,
		callback: (header) => {
			void exportItemFromContextHeader(header);
		},
	});
});

Hooks.on("getFolderContextOptions", (_html, menuItems) => {
	menuItems.push({
		name: "FVTT-PF2E-OBSIDIAN-EXPORTER.CONTEXT.EXPORT-MARKDOWN",
		icon: '<i class="fas fa-file-export"></i>',
		condition: (header) => {
			const folder = getFolderFromContextHeader(header);
			return folder?.type === "Item";
		},
		callback: (header) => {
			void exportFolderFromContextHeader(header);
		},
	});
});

Hooks.on("getCompendiumContextOptions", (_html, menuItems) => {
	menuItems.push({
		name: "FVTT-PF2E-OBSIDIAN-EXPORTER.CONTEXT.EXPORT-MARKDOWN",
		icon: '<i class="fas fa-file-export"></i>',
		condition: (header) => {
			const pack = getCompendiumPackFromContextHeader(header);
			return pack?.documentName === "Item";
		},
		callback: (header) => {
			void exportCompendiumFromContextHeader(header);
		},
	});
});

Hooks.once("ready", () => {
	console.log(MODULE_ID, game.i18n.localize("FVTT-PF2E-OBSIDIAN-EXPORTER.NOTIFICATIONS.READY"));
});

function localizeExporter(key) {
	return game.i18n.localize(`FVTT-PF2E-OBSIDIAN-EXPORTER.${key}`);
}

function formatExporter(key, data) {
	return game.i18n.format(`FVTT-PF2E-OBSIDIAN-EXPORTER.${key}`, data);
}

function notifyExportFailure(key, data, error) {
	console.error(`${MODULE_ID} | Export failed`, error);
	ui.notifications?.error(formatExporter(key, data));
}

// -------------------- Context Resolution Helpers -------------------- //
/**
 * Gets the directory row element associated with a context menu header.
 * @param {HTMLElement} header The context menu header element.
 * @returns {HTMLElement|null} The nearest `.directory-item` element when found.
 */
function getDirectoryItemFromContextHeader(header) {
	return header?.closest?.(".directory-item") ?? null;
}

/**
 * Resolves a compendium pack from context header dataset values.
 * @param {HTMLElement} header The context menu header element.
 * @returns {CompendiumCollection|null} The compendium pack or null when not found.
 */
function getCompendiumPackFromContextHeader(header) {
	const li = getDirectoryItemFromContextHeader(header);
	const packKey = li?.dataset?.pack ?? li?.dataset?.entryId ?? header?.dataset?.pack ?? header?.dataset?.entryId;
	if (!packKey) return null;
	return game.packs.get(packKey) ?? null;
}

/**
 * Resolves an Item document from context header dataset values.
 * @param {HTMLElement} header The context menu header element.
 * @returns {Promise<Item|null>} The resolved item, or null when unavailable.
 */
async function getItemFromContextHeader(header) {
	const li = getDirectoryItemFromContextHeader(header);
	if (!li?.dataset) return null;

	// V13 commonly provides uuid for context rows.
	if (li.dataset.uuid) {
		const doc = await fromUuid(li.dataset.uuid).catch(() => null);
		return doc?.documentName === "Item" ? doc : null;
	}

	// Fallbacks for older/alternate dataset shapes.
	const itemId = li.dataset.entryId ?? li.dataset.documentId;
	if (!itemId) return null;
	return game.items.get(itemId) ?? null;
}

/**
 * Resolves a Folder document from context header dataset values.
 * @param {HTMLElement} header The context menu header element.
 * @returns {Folder|null} The resolved folder, or null when unavailable.
 */
function getFolderFromContextHeader(header) {
	const li = getDirectoryItemFromContextHeader(header);
	if (!li?.dataset) return null;

	if (li.dataset.uuid) {
		const uuid = li.dataset.uuid;
		const uuidParts = foundry.utils.parseUuid(uuid);
		if (uuidParts?.documentType === "Folder") return game.folders.get(uuidParts.documentId) ?? null;
	}

	const folderId = li.dataset.folderId ?? li.dataset.entryId ?? li.dataset.documentId;
	if (!folderId) return null;
	return game.folders.get(folderId) ?? null;
}

// -------------------- Template and Rendering Helpers -------------------- //
/**
 * Maps a PF2E item type to the corresponding module setting key.
 * @param {string} itemType The PF2E item type identifier.
 * @returns {string|undefined} The setting key for the item type.
 */
function getSettingForItemType(itemType) {
	return ITEM_TEMPLATE_SETTINGS.find((entry) => entry.itemType === itemType)?.settingKey;
}

/**
 * Renders a single item into markdown using the configured Handlebars template.
 * @param {Item} item The PF2E item to render.
 * @returns {Promise<string>} Rendered markdown or a fallback error message.
 */
async function renderItemMarkdown(item) {
	const settingKey = getSettingForItemType(item.type);
	if (!settingKey) {
		return formatExporter("EXPORT.MARKDOWN.NO-TEMPLATE", {
			itemName: item.name,
			itemType: item.type,
		});
	}

	const templatePath = game.settings.get(MODULE_ID, settingKey);
	const itemData = item.toObject();

	try {
		return await foundry.applications.handlebars.renderTemplate(templatePath, itemData);
	} catch (error) {
		console.error(`${MODULE_ID} | Failed to render template "${templatePath}" for item "${item.name}"`, error);
		return formatExporter("EXPORT.MARKDOWN.RENDER-FAILED", {
			itemName: item.name,
			templatePath,
			error: String(error),
		});
	}
}

// -------------------- Path and Naming Helpers -------------------- //
/**
 * Collects all Item documents in a folder and its child folders.
 * @param {Folder} folder The root Item folder to traverse.
 * @param {string} [parentPath=""] The accumulated path prefix during recursion.
 * @returns {{ item: Item, path: string }[]} Item entries with their relative export paths.
 */
function collectFolderItemsRecursively(folder, parentPath = "") {
	const currentPath = parentPath ? `${parentPath}/${sanitizeFileName(folder.name)}` : sanitizeFileName(folder.name);
	const directItems = Array.from(folder.contents ?? [])
		.filter((doc) => doc?.documentName === "Item")
		.map((item) => ({ item, path: currentPath }));

	const childFolders = Array.from(folder.children ?? [])
		.map((entry) => entry?.folder ?? entry)
		.filter((child) => child?.documentName === "Folder" && child?.type === "Item");

	const nestedItems = childFolders.flatMap((childFolder) =>
		collectFolderItemsRecursively(childFolder, currentPath),
	);

	return [...directItems, ...nestedItems];
}

/**
 * Resolves a compendium folder reference to a folder object.
 * @param {string|object|null} folderRef A folder id or folder-like object.
 * @param {CompendiumCollection} pack The compendium pack containing folders.
 * @returns {object|null} The resolved folder object or null when unresolved.
 */
function resolveCompendiumFolder(folderRef, pack) {
	if (!folderRef) return null;
	if (typeof folderRef === "object") return folderRef;
	return pack?.folders?.get?.(folderRef) ?? null;
}

/**
 * Builds the export path for a compendium item, including nested folder segments.
 * @param {Item} item The compendium item being exported.
 * @param {CompendiumCollection} pack The source compendium pack.
 * @param {string} rootPath The root folder name used for the export.
 * @returns {string} A slash-delimited export path for the item.
 */
function getCompendiumItemPath(item, pack, rootPath) {
	let currentFolder = resolveCompendiumFolder(item?.folder, pack);
	if (!currentFolder) return rootPath;

	const segments = [];
	while (currentFolder) {
		if (currentFolder.name) segments.unshift(sanitizeFileName(currentFolder.name));
		const parentRef = currentFolder.folder ?? currentFolder.parent ?? null;
		currentFolder = resolveCompendiumFolder(parentRef, pack);
	}

	return segments.length ? `${rootPath}/${segments.join("/")}` : rootPath;
}

// -------------------- Export Actions -------------------- //
/**
 * Renders item entries and writes them into a ZIP archive for download.
 * @param {string} exportName The base name used for the ZIP file.
 * @param {{ item: Item, path: string }[]} entries Items and target paths to export.
 * @returns {Promise<void>}
 */
async function exportItemsAsZip(exportName, entries) {
	const renderedItems = await Promise.all(
		entries.map(async ({ item, path }) => ({
			item,
			path,
			markdown: await renderItemMarkdown(item),
		})),
	);

	const usedNamesByPath = new Map();
	const rootName = sanitizeFileName(exportName);
	const zipEntries = {};

	for (const { item, path, markdown } of renderedItems) {
		const relativePath = path ? String(path).replace(/^\/+|\/+$/g, "") : rootName;
		const zipPath = relativePath || rootName;
		if (!usedNamesByPath.has(zipPath)) usedNamesByPath.set(zipPath, new Set());
		const usedNames = usedNamesByPath.get(zipPath);
		const baseName = getUniqueMarkdownBaseName(item.name, usedNames);
		zipEntries[`${zipPath}/${baseName}.md`] = strToU8(markdown);
	}

	const zipBytes = zipSync(zipEntries, { level: 6 });
	downloadZip(exportName, zipBytes);
}

/**
 * Exports a single item selected from a context menu as a markdown file.
 * @param {HTMLElement} header The context menu header element.
 * @returns {Promise<void>}
 */
async function exportItemFromContextHeader(header) {
	let itemName = "";

	try {
		const item = await getItemFromContextHeader(header);
		if (!item) {
			ui.notifications?.warn(localizeExporter("NOTIFICATIONS.ITEM-NOT-FOUND"));
			return;
		}

		itemName = item.name;
		const markdown = await renderItemMarkdown(item);
		downloadMarkdown(item.name, markdown);
	} catch (error) {
		notifyExportFailure("NOTIFICATIONS.ITEM-EXPORT-FAILED", { itemName: itemName || "Unknown Item" }, error);
	}
}

/**
 * Exports all items from the selected Item folder (including child folders) as a ZIP.
 * @param {HTMLElement} header The context menu header element.
 * @returns {Promise<void>}
 */
async function exportFolderFromContextHeader(header) {
	let folderName = "";

	try {
		const folder = getFolderFromContextHeader(header);
		if (!folder) {
			ui.notifications?.warn(localizeExporter("NOTIFICATIONS.FOLDER-NOT-FOUND"));
			return;
		}

		folderName = folder.name;
		if (folder.type !== "Item") {
			ui.notifications?.warn(formatExporter("NOTIFICATIONS.FOLDER-WRONG-TYPE", { folderName: folder.name }));
			return;
		}

		const folderEntries = collectFolderItemsRecursively(folder);
		if (!folderEntries.length) {
			ui.notifications?.warn(formatExporter("NOTIFICATIONS.FOLDER-EMPTY", { folderName: folder.name }));
			return;
		}

		await exportItemsAsZip(folder.name, folderEntries);
	} catch (error) {
		notifyExportFailure(
			"NOTIFICATIONS.FOLDER-EXPORT-FAILED",
			{ folderName: folderName || "Unknown Folder" },
			error,
		);
	}
}

/**
 * Exports all items in the selected Item compendium as a ZIP.
 * @param {HTMLElement} header The context menu header element.
 * @returns {Promise<void>}
 */
async function exportCompendiumFromContextHeader(header) {
	let packTitle = "";

	try {
		const pack = getCompendiumPackFromContextHeader(header);
		if (!pack) {
			ui.notifications?.warn(localizeExporter("NOTIFICATIONS.COMPENDIUM-NOT-FOUND"));
			return;
		}

		packTitle = pack.title;
		if (pack.documentName !== "Item") {
			ui.notifications?.warn(formatExporter("NOTIFICATIONS.COMPENDIUM-WRONG-TYPE", { packTitle: pack.title }));
			return;
		}

		const documents = await pack.getDocuments();
		const items = documents.filter((doc) => doc?.documentName === "Item");
		if (!items.length) {
			ui.notifications?.warn(formatExporter("NOTIFICATIONS.COMPENDIUM-EMPTY", { packTitle: pack.title }));
			return;
		}

		const rootPath = sanitizeFileName(pack.title);
		const entries = items.map((item) => ({
			item,
			path: getCompendiumItemPath(item, pack, rootPath),
		}));
		await exportItemsAsZip(pack.title, entries);
	} catch (error) {
		notifyExportFailure(
			"NOTIFICATIONS.COMPENDIUM-EXPORT-FAILED",
			{ packTitle: packTitle || "Unknown Compendium" },
			error,
		);
	}
}
