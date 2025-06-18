import CreateLinkModal from '@/app/documents/components/CreateLinkModal';
import ShareableLinkModal from '@/app/documents/components/ShareableLinkModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import InviteModal from '@/components/modals/InviteModal';
import UploadFileModal from '@/components/modals/UploadFileModal';
import { DialogProps } from '@mui/material';
import React from 'react';

/**
 * A union of valid modal types in your app.
 */
export type ModalType =
	| 'deleteConfirm'
	| 'uploadFile'
	| 'inviteUser'
	| 'createLink'
	| 'shareableLink';

/**
 * Defines what each entry in the registry contains:
 * 1) A React component (no <Dialog> inside).
 * 2) Optional default dialog props, typed as partial MUI DialogProps.
 */
interface ModalRegistryEntry {
	component: React.ComponentType<any>;
	defaultDialogProps?: Partial<DialogProps>;
}

/**
 * The main registry of modal types => components + default props.
 */
export const MODAL_REGISTRY: Record<ModalType, ModalRegistryEntry> = {
	deleteConfirm: {
		component: DeleteConfirmModal,
		defaultDialogProps: {
			maxWidth: 'xs',
			fullWidth: true,
		},
	},
	uploadFile: {
		component: UploadFileModal,
		defaultDialogProps: {
			maxWidth: 'sm',
			fullWidth: true,
		},
	},
	inviteUser: {
		component: InviteModal,
		defaultDialogProps: {
			maxWidth: 'xs',
			fullWidth: true,
		},
	},
	createLink: {
		component: CreateLinkModal,
		defaultDialogProps: {
			maxWidth: 'sm',
			fullWidth: true,
		},
	},
	shareableLink: {
		component: ShareableLinkModal,
		defaultDialogProps: {
			maxWidth: 'sm',
			fullWidth: true,
		},
	},
};
