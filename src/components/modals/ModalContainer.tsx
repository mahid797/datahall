import { Dialog } from '@mui/material';

import { ModalDialogProps, useModalContext } from '@/providers/modal/ModalProvider';
import { MODAL_REGISTRY } from '@/providers/modal/ModalRegistry';

export default function ModalContainer() {
	const { currentModal, closeModal } = useModalContext();

	if (!currentModal) {
		return null;
	}

	const { type, dialogProps = {}, contentProps } = currentModal;
	const entry = MODAL_REGISTRY[type];
	if (!entry) {
		console.warn('No registry entry for modal type:', type);
		return null;
	}

	const mergedDialogProps: ModalDialogProps = {
		...entry.defaultDialogProps,
		...dialogProps,
	};

	const ContentComponent = entry.component;

	function handleClose(event: object, reason: 'backdropClick' | 'escapeKeyDown') {
		if (mergedDialogProps.disableBackdropClick && reason === 'backdropClick') {
			return;
		}
		mergedDialogProps.onClose?.(event as any, reason);

		// Finally close the modal
		closeModal();
	}

	return (
		<Dialog
			open
			{...mergedDialogProps}
			onClose={handleClose}>
			<ContentComponent
				{...contentProps}
				closeModal={closeModal}
			/>
		</Dialog>
	);
}
