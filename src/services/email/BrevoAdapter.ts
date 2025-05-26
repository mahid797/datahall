import axios from 'axios';
import { BaseAdapter } from './BaseAdapter';
import { type TransactionalMail } from './emailUtils';

const API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;
const FROM_NAME = process.env.EMAIL_FROM_NAME;
const FROM_EMAIL = process.env.EMAIL_FROM_ADDR;

export class BrevoAdapter extends BaseAdapter {
	/**
	 * Sends the e‑mail via Brevo’s SMTP API.
	 *
	 * @param mail The fully‑rendered mail object.
	 */
	async sendTransactional(mail: TransactionalMail): Promise<void> {
		if (!API_KEY || !FROM_NAME || !FROM_EMAIL) {
			console.warn('[BrevoAdapter] Missing email configuration. Skipping send.');
			return;
		}

		try {
			await axios.post(
				API_URL,
				{
					sender: { name: FROM_NAME, email: FROM_EMAIL },
					to: [{ email: mail.to }],
					subject: mail.subject,
					htmlContent: mail.html,
					textContent: mail.text,
				},
				{
					headers: {
						'api-key': API_KEY,
						'Content-Type': 'application/json',
					},
				},
			);
		} catch (err) {
			console.warn(
				'[BrevoAdapter] Failed to send email:',
				err instanceof Error ? err.message : err,
			);
		}
	}
}
