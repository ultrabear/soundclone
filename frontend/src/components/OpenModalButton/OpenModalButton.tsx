import { useModal } from "../../context/useModal";

interface OpenModalButtonTy {
	modalComponent: JSX.Element; // component to render inside the modal
	buttonText: string; // text of the button that opens the modal
	onButtonClick?: () => void; // optional: callback function that will be called once the modal is closed
	onModalClose?: () => void; // optional: callback function that will be called once the button that opens the modal is clicked
	classes?: string;
}
function OpenModalButton({
	modalComponent, // component to render inside the modal
	buttonText, // text of the button that opens the modal
	onButtonClick, // optional: callback function that will be called once the button that opens the modal is clicked
	onModalClose, // optional: callback function that will be called once the modal is closed
	classes,
}: React.PropsWithRef<OpenModalButtonTy>) {
	const { setModalContent, setOnModalClose } = useModal();

	const onClick = () => {
		if (onModalClose) setOnModalClose(onModalClose);
		setModalContent(modalComponent);
		if (typeof onButtonClick === "function") onButtonClick();
	};

	return (
		<button
			aria-label={buttonText}
			className={classes}
			type="button"
			onClick={onClick}
		>
			{buttonText}
		</button>
	);
}

export default OpenModalButton;
