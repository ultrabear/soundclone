import { useModal } from "../../context/useModal";

interface OpenModalMenuTy {
	modalComponent: JSX.Element; // component to render inside the modal
	itemText: string; // text of the button that opens the modal
	onItemClick?: () => void; // optional: callback function that will be called once the button that opens the modal is clicked
	onModalClose?: () => void; // optional: callback function that will be called once the modal is closed
}

function OpenModalMenuItem({
	modalComponent,
	itemText,
	onItemClick,
	onModalClose,
}: React.PropsWithRef<OpenModalMenuTy>) {
	const { setModalContent, setOnModalClose } = useModal();

	const onClick = () => {
		if (onModalClose) setOnModalClose(onModalClose);
		setModalContent(modalComponent);
		if (typeof onItemClick === "function") onItemClick();
	};

	return <li onClick={onClick}>{itemText}</li>;
}

export default OpenModalMenuItem;
