import { useContext, useState } from "react";
import { useRef, createContext } from "react";
import "./Modal.css";
import { createPortal } from "react-dom";

interface ModalContextTy {
	modalRef: React.MutableRefObject<HTMLDivElement | null>;
	modalContent: JSX.Element | null;
	setModalContent: (_: JSX.Element | null) => void;
	closeModal: () => void;
	setOnModalClose: (_: () => void) => void;
}

export const ModalContext = createContext({} as ModalContextTy);

export function ModalProvider<T>({
	children,
}: import("react").PropsWithChildren<T>) {
	/** @type {React.MutableRefObject<HTMLDivElement | null>} */
	const modalRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

	const [modalContent, setModalContent] = useState(
		() => null as JSX.Element | null,
	);

	const [onModalClose, setOnModalClose] = useState(() => () => { return });

	const closeModal = () => {
		setModalContent(null);
		if (typeof onModalClose === "function") {
			setOnModalClose(() => null);
			onModalClose();
		}
	};

	const contextValue = {
		modalRef,
		modalContent,
		setModalContent,
		setOnModalClose,
		closeModal,
	};

	return (
		<>
			<ModalContext.Provider value={contextValue}>
				{children}
			</ModalContext.Provider>
			<div ref={modalRef} />
		</>
	);
}

export function Modal() {
	const { modalRef, modalContent, closeModal } = useContext(ModalContext);

	if (!modalRef || !modalRef.current || !modalContent) return null;

	return createPortal(
		<div id="modal">
			<div id="modal-background" onClick={closeModal} />
			<div id="modal-content">{modalContent}</div>
		</div>,
		modalRef.current,
	);
}
