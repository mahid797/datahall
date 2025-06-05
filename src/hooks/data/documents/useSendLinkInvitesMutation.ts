import { useMutation } from '@tanstack/react-query';

import { useToast } from '@/hooks';

interface SendInviteParams {
	documentId: string;
	linkUrl: string;
	recipients: string[];
}

/**
 * Fire-and-forget helper – will POST to the future “invite” endpoint
 * once it exists.  For now it simply logs the payload and resolves.
 *
 * @param documentId  doc the link belongs to
 */

/* TODO: replace console.log with real endpoint when available */
export default function useSendLinkInvitesMutation({
	documentId,
	linkUrl,
	recipients,
}: SendInviteParams) {
	const toast = useToast();

	return useMutation({
		mutationFn: async (payload: { linkUrl: string; recipients: string[] }) => {
			/* TODO: replace with real axios.post when API is ready */
			console.info('TODO send invites', { documentId, linkUrl, recipients });
			// await axios.post(`/api/documents/${documentId}/links/email`, payload);
		},
		onSuccess: () => toast.showToast({ message: 'Invites sent successfully!', variant: 'success' }),
		onError: (err: any) =>
			toast.showToast({
				message: err?.response?.data?.message ?? 'Failed to send invites. Please try again later.',
				variant: 'error',
			}),
	});
}
