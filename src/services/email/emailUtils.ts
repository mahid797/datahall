import { render } from '@react-email/render';
import { createElement, type FC, type ReactElement } from 'react';

import * as ResetPasswordTemplate from './templates/ResetPasswordEmail';
import * as VerificationTemplate from './templates/VerificationEmail';

export interface TemplateModule<Props = unknown> {
	default: FC<Props>;
	subject: string;
	label?: string;
}

export type TransactionalMail = {
	to: string;
	subject: string;
	html: string;
	text: string;
	label?: string;
};

/**
 * Render a ReactEmail component to HTML or plain‑text.
 *
 * @param component The JSX element to render.
 * @param plainText When `true`, returns a plain‑text version.
 * @returns A rendered string.
 */
async function renderTemplate(component: ReactElement, plainText = false): Promise<string> {
	return render(component, { pretty: true, plainText });
}

/**
 * Build a {@link TransactionalMail} object for any template.
 *
 * @template Props Template’s prop shape.
 * @param to       Target e‑mail address.
 * @param template The template module (component + metadata).
 * @param props    Props passed into the React component.
 * @returns Transactional mail object.
 */
async function buildEmail<Props>(
	to: string,
	template: TemplateModule<Props>,
	props: Props,
): Promise<TransactionalMail> {
	const element = createElement(template.default as FC<any>, props);

	const html = await renderTemplate(element);
	const text = await renderTemplate(element, true);

	return {
		to,
		subject: template.subject,
		html,
		text,
		label: template.label,
	};
}

/**
 * Build a verification e‑mail.
 *
 * @param args.to    Recipient address.
 * @param args.token Verification token (will be embedded in URL).
 * @param args.name  Optional personalisation.
 * @returns Transactional mail object.
 */
export async function buildVerificationMail(args: {
	to: string;
	token: string;
	name?: string;
}): Promise<TransactionalMail> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
	const url = `${appUrl}/api/auth/verify?token=${args.token}`;

	return buildEmail(args.to, VerificationTemplate, { url, name: args.name });
}

/**
 * Build a reset‑password e‑mail.
 *
 * @param args.to    Recipient address.
 * @param args.token Password‑reset token (embedded in URL).
 * @returns Transactional mail object.
 */
export async function buildResetPasswordMail(args: {
	to: string;
	token: string;
}): Promise<TransactionalMail> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
	const url = `${appUrl}/auth/reset-password?token=${args.token}`;

	return buildEmail(args.to, ResetPasswordTemplate, { url });
}
