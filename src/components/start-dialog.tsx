import { PropsWithChildren, useState } from 'react';
import { Dialog } from '@headlessui/react';
import styled from 'styled-components';

import NewSessionForm, { NewSessionData } from './common/new-session-form';

const DialogContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function StartDialog({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);

  function closeModal(newSessionData: NewSessionData) {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onClose={() => void 0}>
      <Dialog.Panel>
        <DialogContentWrapper>
          <NewSessionForm onSubmit={closeModal} />

          {children}
        </DialogContentWrapper>
      </Dialog.Panel>
    </Dialog>
  );
}

export default StartDialog;
