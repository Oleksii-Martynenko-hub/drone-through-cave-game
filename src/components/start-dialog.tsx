import { PropsWithChildren, useState } from 'react';
import { Dialog } from '@headlessui/react';

import Button from './common/button';

function StartDialog({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Button onClick={closeModal}>Play</Button>

      {children}
    </Dialog>
  );
}

export default StartDialog;
