import { TransactionalMail, buildResetPasswordMail, buildVerificationMail } from './emailUtils';

export abstract class BaseAdapter {
	/**
	 * Low‑level delivery routine implemented by each adapter.
	 */
	abstract sendTransactional(mail: TransactionalMail): Promise<void>;

	/**
	 * Sends an account‑verification e‑mail.
	 * @param to Recipient address.
	 * @param token Verification token.
	 * @param name Optional recipient name.
	 */
	async sendVerificationEmail(to: string, token: string, name?: string): Promise<void> {
		const mail = await buildVerificationMail({ to, token, name });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a password‑reset e‑mail.
	 * @param to Recipient address.
	 * @param token Reset‑password token.
	 */
	async sendResetPasswordEmail(to: string, token: string): Promise<void> {
		const mail = await buildResetPasswordMail({ to, token });
		await this.sendTransactional(mail);
	}
}
