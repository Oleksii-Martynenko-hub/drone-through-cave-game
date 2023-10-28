import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import ReactPortal from './react-portal';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledModal = styled.div`
  position: fixed;
  inset: 0; /* inset sets all 4 values (top right bottom left) much like how we set padding, margin etc., */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  z-index: 999;
  padding: 40px 20px 20px;
`;

interface Props {
  isOpen: boolean;
}

function Modal({ isOpen, children }: PropsWithChildren<Props>) {
  if (!isOpen) return null;

  return (
    <ReactPortal wrapperId="react-portal-modal-container">
      <StyledModal>
        <ModalContent>{children}</ModalContent>
      </StyledModal>
    </ReactPortal>
  );
}

export default Modal;
