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
    | 'Archives'
    | 'Other';

/** Fixed display order for the groups. */
export const DOC_CATEGORY_ORDER: DocCategory[] = [
    'Geophysical logs',
    'Reports & completion',
    'Geochemistry & analyses',
    'Data & spreadsheets',
    'Core photos',
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

// Curve/tool names and log markers. `gamm?a` catches the "GAMA" misspelling seen in the data.
const LOG_RE = /induction|density|sonic|gamm?a|resistiv|poros|caliper|triple[\s_]?combo|neutron|welllog|well[\s_]?log/i;
const GEOCHEM_RE = /\bicp\b|\btoc\b|xrd|xrf|assay|geochem|analys/i;
const REPORT_RE = /completion|coregraph|report|summary/i;
const PHOTO_RE = /core[\s_]?photo|_photo|photo[\s_]/i;

/**
 * Best-effort document type from a filename. Order matters: a curve-named `.tif`
 * or a keyword-bearing `.pdf` is classified by meaning before its format bucket.
 */
export function classifyDocument(filename: string): DocCategory {
    const ext = fileExtension(filename);
    if (ext === 'las' || LOG_RE.test(filename)) return 'Geophysical logs';
    if (GEOCHEM_RE.test(filename)) return 'Geochemistry & analyses';
    if (REPORT_RE.test(filename) || REPORT_EXTS.has(ext)) return 'Reports & completion';
    if (PHOTO_RE.test(filename) || IMAGE_EXTS.has(ext)) return 'Core photos';
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
