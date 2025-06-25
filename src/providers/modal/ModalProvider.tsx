'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { DialogProps } from '@mui/material';
import { ModalType } from './ModalRegistry';
import ModalContainer from '@/components/modals/ModalContainer';

export type ModalDialogProps = Partial<
	DialogProps & {
		/** Prevent closing via backdrop clicks (e.g. password gates) */
		disableBackdropClick?: boolean;
	}
>;

/* -------------------------------------------------------------------------- */
/*  Context types                                                             */
/* -------------------------------------------------------------------------- */
export interface OpenModalConfig {
	type: ModalType;
	dialogProps?: ModalDialogProps;
	contentProps?: Record<string, unknown>;
}

type CurrentModalState = OpenModalConfig;

interface ModalContextValue {
	currentModal: CurrentModalState | null;
	openModal: (config: OpenModalConfig) => void;
	closeModal: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */
const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [currentModal, setCurrentModal] = useState<CurrentModalState | null>(null);

	const openModal = useCallback((config: OpenModalConfig) => setCurrentModal(config), []);
	const closeModal = useCallback(() => setCurrentModal(null), []);

	return (
		<ModalContext.Provider value={{ currentModal, openModal, closeModal }}>
			{children}
			<ModalContainer />
		</ModalContext.Provider>
	);
}

export function useModalContext(): ModalContextValue {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModalContext must be used within a <ModalProvider>');
	}
	return context;
}
