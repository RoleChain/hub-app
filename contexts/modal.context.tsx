import { createContext, useState } from "react";

type ModalType = "auth" | "credit";

type TModalContext = {
  isOpen: boolean;
  modalType: ModalType;
  open: () => void;
  close: () => void;
  changeModalType: (type: ModalType) => void;
};

const ModalContext = createContext<TModalContext>({
  isOpen: false,
  modalType: "auth",
  open: () => {},
  close: () => {},
  changeModalType: () => {},
});

const ModalContextProvider = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("auth");

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const changeModalType = (newType: ModalType) => {
    setModalType(newType);
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, modalType, open, close, changeModalType }}
    ></ModalContext.Provider>
  );
};

export { ModalContext, ModalContextProvider };
