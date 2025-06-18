/**
 * Quick CSV exporter – converts any array of serialisable objects to CSV and
 * triggers a browser download.  Uses json2csv & file-saver under the hood.
 *
 */

import saveAs from 'file-saver';
import { Parser } from '@json2csv/plainjs';

/**
 * Downloads an array of objects as a UTF-8 CSV file.
 *
 * @param rows      – plain JSON objects
 * @param filename  – e.g. "analytics.csv"
 */

export function exportToCsv<T extends object>(rows: T[], filename: string) {
	if (!rows.length) return;

	const parser = new Parser();
	const csv = parser.parse(rows);

	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	saveAs(blob, filename);
}
