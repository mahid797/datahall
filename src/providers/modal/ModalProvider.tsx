'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DialogProps } from '@mui/material';
import { ModalType } from './ModalRegistry';
import ModalContainer from '@/components/modals/ModalContainer';

interface OpenModalConfig {
	type: ModalType;
	dialogProps?: Partial<DialogProps>;
	contentProps?: Record<string, unknown>;
}
interface CurrentModalState extends OpenModalConfig {}

interface ModalContextValue {
	currentModal: CurrentModalState | null;
	openModal: (config: OpenModalConfig) => void;
	closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [currentModal, setCurrentModal] = useState<CurrentModalState | null>(null);

	function openModal(config: OpenModalConfig) {
		setCurrentModal(config);
	}

	function closeModal() {
		setCurrentModal(null);
	}

	const value: ModalContextValue = {
		currentModal,
		openModal,
		closeModal,
	};

	return (
		<ModalContext.Provider value={value}>
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
