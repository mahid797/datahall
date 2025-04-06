import { useModalContext } from '@/providers/modal/ModalProvider';
import { MODAL_REGISTRY } from '@/providers/modal/ModalRegistry';
import { Dialog } from '@mui/material';

export default function ModalContainer() {
	const { currentModal, closeModal } = useModalContext();

	if (!currentModal) {
		return null;
	}

	const entry = MODAL_REGISTRY[currentModal.type];
	if (!entry) {
		console.warn('No registry entry for modal type:', currentModal.type);
		return null;
	}

	const mergedDialogProps = {
		...entry.defaultDialogProps,
		...(currentModal.dialogProps || {}),
	};

	const ContentComponent = entry.component;

	function handleClose() {
		closeModal();
	}

	return (
		<Dialog
			open
			onClose={handleClose}
			{...mergedDialogProps}>
			<ContentComponent
				{...currentModal.contentProps}
				closeModal={closeModal}
			/>
		</Dialog>
	);
}
