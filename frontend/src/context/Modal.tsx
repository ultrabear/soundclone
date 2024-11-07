import { useContext, useState } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "./ModalCore";

export function ModalProvider<T>({
	children,
}: import("react").PropsWithChildren<T>) {
	/** @type {React.MutableRefObject<HTMLDivElement | null>} */
	const modalRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

	const [modalContent, setModalContent] = useState(
		() => null as JSX.Element | null,
	);

	const [onModalClose, setOnModalClose] = useState(() => () => {
		return;
	});

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
