import { createContext, useContext } from "react";

interface ModalContextTy {
	modalRef: React.MutableRefObject<HTMLDivElement | null>;
	modalContent: JSX.Element | null;
	setModalContent: (_: JSX.Element | null) => void;
	closeModal: () => void;
	setOnModalClose: (_: () => void) => void;
}

export const ModalContext = createContext({} as ModalContextTy);

export const useModal = () => useContext(ModalContext);
