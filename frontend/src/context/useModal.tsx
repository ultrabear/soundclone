import { useContext } from "react";
import { ModalContext } from "./ModalCore";

export const useModal = () => useContext(ModalContext);
