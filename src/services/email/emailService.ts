import { BaseAdapter } from './BaseAdapter';
import { BrevoAdapter } from './BrevoAdapter';
import { DevAdapter } from './DevAdapter';

function canSendEmails(): boolean {
	const { SEND_EMAILS, BREVO_API_KEY, EMAIL_FROM_ADDR, EMAIL_FROM_NAME } = process.env;

	const wantSend = (SEND_EMAILS ?? '').toLowerCase() === 'true';
	const haveCreds = !!BREVO_API_KEY && !!EMAIL_FROM_ADDR && !!EMAIL_FROM_NAME;

	return wantSend && haveCreds;
}

const Adapter: new () => BaseAdapter = canSendEmails() ? BrevoAdapter : DevAdapter;

/**
 * Singleton e‑mail service used throughout the app.
 */
export const emailService: BaseAdapter = new Adapter();
