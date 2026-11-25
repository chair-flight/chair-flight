import { Button } from "../../../libs/ui/components/base/button";
import { Dialog } from "../../../libs/ui/components/base/dialog";
import { Modal } from "../../../libs/ui/components/base/modal";
import { useDisclose } from "../../../libs/ui/hooks/use-disclose";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseModal: FC = () => {
  const modal = useDisclose();

  return (
    <StoryBlock title="Open and close">
      <div>
        <Button onClick={modal.open}>Open modal</Button>
        <Modal open={modal.isOpen} onClose={modal.close}>
          <div className="p-6 text-sm">
            Closed with Escape or a click outside.
          </div>
        </Modal>
      </div>
    </StoryBlock>
  );
};

export const BaseDialog: FC = () => {
  const modal = useDisclose();

  return (
    <StoryBlock title="In a modal">
      <div>
        <Button onClick={modal.open}>Open dialog</Button>
        <Modal open={modal.isOpen} onClose={modal.close}>
          <Dialog
            title="Dialog"
            footer={<Button onClick={modal.close}>Done</Button>}
            onClose={modal.close}
          >
            <p className="m-0 text-sm">
              Closed with Escape, a click outside, or its button.
            </p>
          </Dialog>
        </Modal>
      </div>
    </StoryBlock>
  );
};
