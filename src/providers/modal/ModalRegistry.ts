import React from 'react';

import { DialogProps } from '@mui/material';

import DocumentAccessModal from '@/app/documentAccess/[linkId]/components/DocumentAccessModal';
import VisitorLogModal from '@/app/documents/[documentId]/components/VisitorLogModal';
import LinkCopyModal from '@/app/documents/components/LinkCopyModal';
import LinkCreateModal from '@/app/documents/components/LinkCreateModal';
import PasswordChangeModal from '@/app/profile/components/PasswordChangeModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import InviteModal from '@/components/modals/InviteModal';
import UploadFileModal from '@/components/modals/UploadFileModal';
import { ModalDialogProps } from './ModalProvider';

/**
 * A union of valid modal types in your app.
 */
export type ModalType =
	| 'deleteConfirm'
	| 'uploadFile'
	| 'inviteUser'
	| 'linkCreate'
	| 'linkCopy'
	| 'passwordChange'
	| 'visitorLog'
	| 'documentAccess';

/**
 * Defines what each entry in the registry contains:
 * 1) A React component (no <Dialog> inside).
 * 2) Optional default dialog props, typed as partial MUI DialogProps.
 */
interface ModalRegistryEntry {
	component: React.ComponentType<any>;
	defaultDialogProps?: ModalDialogProps;
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
	linkCreate: {
		component: LinkCreateModal,
		defaultDialogProps: {
			maxWidth: 'sm',
			fullWidth: true,
		},
	},
	linkCopy: {
		component: LinkCopyModal,
		defaultDialogProps: { maxWidth: 'sm', fullWidth: true },
	},
	passwordChange: {
		component: PasswordChangeModal,
		defaultDialogProps: { maxWidth: 'sm', fullWidth: true },
	},
	visitorLog: {
		component: VisitorLogModal,
		defaultDialogProps: { maxWidth: 'md', fullWidth: true },
	},
	documentAccess: {
		component: DocumentAccessModal,
		defaultDialogProps: { maxWidth: 'sm', fullWidth: true },
	},
};
