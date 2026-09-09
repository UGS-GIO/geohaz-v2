/**
 * Heuristic classification of a UCRC document by its filename, used to group the
 * subsurface Documents panel.
 *
 * There is no authoritative document-type field on the attachments record today,
 * so type is derived from the filename (with the extension as a fallback). It is
 * only as good as the filenames and will shift a little as staff rename files; a
 * curated type field would supersede this if one is ever added.
 */

export type DocCategory =
    | 'Geophysical logs'
    | 'Reports & completion'
    | 'Geochemistry & analyses'
    | 'Data & spreadsheets'
    | 'Core photos'
    | 'Images & scans'
    | 'Archives'
    | 'Other';

/** Fixed display order for the groups. */
export const DOC_CATEGORY_ORDER: DocCategory[] = [
    'Geophysical logs',
    'Reports & completion',
    'Geochemistry & analyses',
    'Data & spreadsheets',
    'Core photos',
    'Images & scans',
    'Archives',
    'Other',
];

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff']);
const DATA_EXTS = new Set(['xls', 'xlsx', 'xlsb', 'xlsm', 'xlxs', 'csv', 'tsv', 'txt', 'xyz']);
const ARCHIVE_EXTS = new Set(['zip', 'gz', '7z', 'tar', 'rar']);
const REPORT_EXTS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'rtf']);
// tif/tiff stay in IMAGE_EXTS for classification, but Chrome/Firefox/Edge download
// TIFF rather than render it inline, so it's excluded here — the row reads "Download".
const PREVIEWABLE_EXTS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp']);

/** Lowercased extension without the dot, or '' when there is none. */
export function fileExtension(filename: string): string {
    const m = /\.([a-z0-9]+)$/i.exec(filename);
    return m ? m[1].toLowerCase() : '';
}

// Distinctive curve/tool/log stems. Safe as plain substrings — they don't collide with
// non-log words in the real filenames. `gamm?a` catches the "GAMA" misspelling in the data;
// `combo` catches "Triple Print Combo" etc.; `mud[\s_]?log` catches MUD_LOG / mudlog.
const LOG_STEM_RE = /induction|resistiv|poro|caliper|neutron|density|sonic|gamm?a|spectralog|combo|cement[\s_]?bond|mud[\s_]?log|well[\s_]?log/i;
// Short/ambiguous log tokens that need a separator boundary so they don't fire inside words
// like "geological" or "catalog". Underscore counts as a separator here; \b does not, and
// these filenames are underscore-heavy (MUD_LOG, ..._CBL_Page_1).
const LOG_TOKEN_RE = /(?:^|[^a-z0-9])(?:logs?|cbl)(?![a-z])/i;
const GEOCHEM_RE = /\bicp\b|\btoc\b|xrd|xrf|assay|geochem|analys/i;
const REPORT_RE = /completion|coregraph|report|summary/i;
const PHOTO_RE = /core[\s_]?photo|_photo|photo[\s_]/i;

// Windows/GIS sidecar files that are not documents anyone opens (Thumbs.db, ESRI .prj/.ovr/
// .aux.xml, log-tool .meta). Hidden from the panel entirely rather than shown with a badge.
const JUNK_EXTS = new Set(['prj', 'ovr', 'aux', 'meta', 'xml', 'ini', 'tmp']);

/** True for sidecar/junk files that should not be listed as documents. */
export function isJunkFile(filename: string): boolean {
    if (filename.toLowerCase().endsWith('thumbs.db')) return true;
    return JUNK_EXTS.has(fileExtension(filename));
}

/**
 * Best-effort document type from a filename. Order matters: meaning beats format, so a
 * curve-named `.tif` or a keyword-bearing `.pdf` is classified before its extension bucket.
 * The image-extension fallback is "Images & scans" (honest) rather than "Core photos" —
 * only a filename that actually reads like a photo lands in Core photos.
 */
export function classifyDocument(filename: string): DocCategory {
    const ext = fileExtension(filename);
    // Strong, unambiguous log signals (LAS, named curves/tools) win outright.
    if (ext === 'las' || LOG_STEM_RE.test(filename)) return 'Geophysical logs';
    // Geochem keywords beat the weaker bare-"log" token, so "ICP log.xlsx" stays geochem.
    if (GEOCHEM_RE.test(filename)) return 'Geochemistry & analyses';
    if (LOG_TOKEN_RE.test(filename)) return 'Geophysical logs';
    if (PHOTO_RE.test(filename)) return 'Core photos';
    if (REPORT_RE.test(filename) || REPORT_EXTS.has(ext)) return 'Reports & completion';
    if (IMAGE_EXTS.has(ext)) return 'Images & scans';
    if (DATA_EXTS.has(ext)) return 'Data & spreadsheets';
    if (ARCHIVE_EXTS.has(ext)) return 'Archives';
    return 'Other';
}

/** Short uppercase format badge, e.g. "PDF", "LAS", "XLSX", "JPG", "TIF". */
export function formatBadge(filename: string): string {
    const ext = fileExtension(filename);
    if (!ext) return 'FILE';
    if (ext === 'jpeg') return 'JPG';
    if (ext === 'tiff') return 'TIF';
    return ext.toUpperCase();
}

/** Whether the browser can show this inline (so the row action reads "Open" vs "Download"). */
export function isPreviewable(filename: string): boolean {
    return PREVIEWABLE_EXTS.has(fileExtension(filename));
}
