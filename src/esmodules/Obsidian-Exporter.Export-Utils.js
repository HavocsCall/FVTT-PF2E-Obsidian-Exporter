/**
 * Sanitizes a filename so it is safe for downloads across operating systems.
 * @param {string} name The original filename.
 * @returns {string} A safe filename, or "export" when empty after sanitization.
 */
export function sanitizeFileName(name) {
	const withoutIllegalChars = String(name).replace(/[<>:"/\\|?*]/g, "_");
	const withoutControlChars = Array.from(withoutIllegalChars, (char) =>
		char.charCodeAt(0) < 32 ? "_" : char,
	).join("");
	return withoutControlChars.trim() || "export";
}

/**
 * Ensures a markdown base filename is unique within an export path by appending numeric suffixes.
 * @param {string} name The preferred filename.
 * @param {Set<string>} usedNames Set of already-used base names.
 * @returns {string} A unique, sanitized markdown base filename.
 */
export function getUniqueMarkdownBaseName(name, usedNames) {
	const baseName = sanitizeFileName(name);
	if (!usedNames.has(baseName)) {
		usedNames.add(baseName);
		return baseName;
	}

	let index = 2;
	let candidate = `${baseName} (${index})`;
	while (usedNames.has(candidate)) {
		index += 1;
		candidate = `${baseName} (${index})`;
	}
	usedNames.add(candidate);
	return candidate;
}

/**
 * Creates and downloads a blob as a file in the browser.
 * @param {string} fileName The base name to use for the file.
 * @param {string} extension The file extension without a leading dot.
 * @param {string} mimeType The MIME type of the blob content.
 * @param {string|Uint8Array} content The content written into the blob.
 * @returns {void}
 */
export function downloadBlob(fileName, extension, mimeType, content) {
	const blob = new Blob([content], { type: mimeType });
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = objectUrl;
	link.download = `${sanitizeFileName(fileName)}.${extension}`;
	link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
	setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
}

/**
 * Downloads markdown text as a `.md` file.
 * @param {string} fileName The base filename to use.
 * @param {string} content The markdown content.
 * @returns {void}
 */
export function downloadMarkdown(fileName, content) {
	downloadBlob(fileName, "md", "text/markdown;charset=utf-8", content);
}

/**
 * Downloads zip bytes as a `.zip` file.
 * @param {string} fileName The base filename to use.
 * @param {Uint8Array} zipBytes The compressed ZIP byte array.
 * @returns {void}
 */
export function downloadZip(fileName, zipBytes) {
	downloadBlob(fileName, "zip", "application/zip", zipBytes);
}
