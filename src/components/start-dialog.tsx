import { PropsWithChildren } from 'react';
import { Dialog } from '@headlessui/react';
import styled from 'styled-components';

const DialogContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;
interface Props {
  isOpen: boolean;
}

function StartDialog({ isOpen, children }: PropsWithChildren<Props>) {
  return (
    <Dialog open={isOpen} onClose={() => void 0}>
      <Dialog.Panel>
        <DialogContentWrapper>{children}</DialogContentWrapper>
      </Dialog.Panel>
    </Dialog>
  );
}

export default StartDialog;
