import { BaseAdapter } from './BaseAdapter';
import { type TransactionalMail } from './emailUtils';

function extractLink(text: string): string {
	const match = text.match(/https?:\/\/\S+/);
	return match ? match[0] : '';
}

export class DevAdapter extends BaseAdapter {
	async sendTransactional(mail: TransactionalMail): Promise<void> {
		const timestamp = new Date().toLocaleString();
		const link = extractLink(mail.text);

		console.groupCollapsed(
			`%c[Email Log] %c${mail.label ?? 'Transactional Email'}`,
			'color:#3b82f6;font-weight:bold;',
			'color:#111827;font-weight:bold;',
		);

		console.info('%c🕑 Timestamp:', 'color:#7c3aed;font-weight:bold;', timestamp);
		console.info('%c📧 To:', 'color:#22c55e;font-weight:bold;', mail.to);
		console.info('%c📝 Subject:', 'color:#facc15;font-weight:bold;', mail.subject);
		if (link) {
			console.info('%c🔗 Link:', 'color:#10b981;font-weight:bold;', link);
		}
		console.info(
			'%c🌐 Environment:',
			'color:#06b6d4;font-weight:bold;',
			process.env.NODE_ENV ?? 'unknown',
		);
		console.info('--------------------------------------------------');

		console.groupCollapsed(
			'%c🧾 Text Version (copy‑paste friendly)',
			'color:#6366f1;font-weight:bold;',
		);
		console.info(mail.text);
		console.groupEnd();

		// console.groupCollapsed(
		// 	'%c🖼️  HTML Version (for template debugging)',
		// 	'color:#ec4899;font-weight:bold;',
		// );
		// console.info(mail.html);
		console.groupEnd();

		console.groupEnd();
	}
}
