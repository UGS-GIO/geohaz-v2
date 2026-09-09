import { describe, it, expect } from 'vitest';
import { classifyDocument, formatBadge, isPreviewable, fileExtension } from '../classify';

describe('classifyDocument', () => {
    it('classifies LAS and curve-named rasters as geophysical logs', () => {
        expect(classifyDocument('0503306123_WELLLOG.LAS')).toBe('Geophysical logs');
        expect(classifyDocument('0508306628_TRIPLE_COMBO NPHI.tif')).toBe('Geophysical logs');
        expect(classifyDocument('0503306097_INDUCTION.tif')).toBe('Geophysical logs');
        // "GAMA" misspelling in the real data still lands as a log
        expect(classifyDocument('0503306097_CORE_GAMA_RAY.tif')).toBe('Geophysical logs');
    });

    it('classifies ICP/TOC as geochemistry, even as a spreadsheet', () => {
        expect(classifyDocument('PR-15-7c ICP and TOC summary.xlsx')).toBe('Geochemistry & analyses');
    });

    it('classifies completion/coregraph and generic PDFs as reports', () => {
        expect(classifyDocument('Rector 8X Completion Coregraph(1.0).pdf')).toBe('Reports & completion');
        expect(classifyDocument('08-18-1_wellsite_log.pdf')).toBe('Reports & completion');
    });

    it('classifies depth-named core-photo images as core photos', () => {
        expect(classifyDocument('Carbon_Canal_5-12_Core_Photo_overview_8805.0-8810.0.jpg')).toBe('Core photos');
    });

    it('classifies plain spreadsheets/csv as data', () => {
        expect(classifyDocument('_AlderanDH_Results.xlsx')).toBe('Data & spreadsheets');
        expect(classifyDocument('samples.csv')).toBe('Data & spreadsheets');
    });

    it('falls back to Other for unknown/extensionless files', () => {
        expect(classifyDocument('mystery.db')).toBe('Other');
        expect(classifyDocument('noext')).toBe('Other');
    });
});

describe('formatBadge', () => {
    it('maps extensions to short uppercase badges', () => {
        expect(formatBadge('a.pdf')).toBe('PDF');
        expect(formatBadge('a.LAS')).toBe('LAS');
        expect(formatBadge('a.xlsx')).toBe('XLSX');
        expect(formatBadge('a.jpeg')).toBe('JPG');
        expect(formatBadge('a.tiff')).toBe('TIF');
        expect(formatBadge('noext')).toBe('FILE');
    });
});

describe('isPreviewable', () => {
    it('is true for pdf and images, false for logs/data', () => {
        expect(isPreviewable('a.pdf')).toBe(true);
        expect(isPreviewable('a.jpg')).toBe(true);
        expect(isPreviewable('a.las')).toBe(false);
        expect(isPreviewable('a.xlsx')).toBe(false);
    });

    it('treats tif/tiff as not previewable (mainstream browsers download them)', () => {
        expect(isPreviewable('0503306097_INDUCTION.tif')).toBe(false);
        expect(isPreviewable('a.tiff')).toBe(false);
    });
});

describe('fileExtension', () => {
    it('lowercases and drops the dot; empty when none', () => {
        expect(fileExtension('A.PDF')).toBe('pdf');
        expect(fileExtension('a.b.csv')).toBe('csv');
        expect(fileExtension('noext')).toBe('');
    });
});
