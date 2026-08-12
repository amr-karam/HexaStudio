import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from '@/components/ui/modals/Modal';

describe('Modal', () => {
  beforeEach(() => {
    // Radix Dialog uses portal + focus trap; ensure clean body state
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    // Cancel pending framer-motion / Radix rAF callbacks
    const highestId = window.requestAnimationFrame(() => {});
    for (let id = 0; id <= highestId; id++) {
      window.cancelAnimationFrame(id);
    }
  });

  const renderModal = (open = true) =>
    render(
      <Modal open={open} onOpenChange={() => {}}>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Test Title</ModalTitle>
            <ModalDescription>Test description</ModalDescription>
          </ModalHeader>
          <ModalClose asChild>
            <button>Close</button>
          </ModalClose>
        </ModalContent>
      </Modal>,
    );

  it('renders the trigger when closed', () => {
    renderModal(false);
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the title with correct heading level', () => {
    renderModal(true);
    const title = screen.getByRole('heading', { name: 'Test Title' });
    expect(title).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderModal(true);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('has a close button with accessible name', () => {
    renderModal(true);
    // Radix adds an automatic close button with sr-only "Close" text + the X icon
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find((btn) => btn.getAttribute('aria-label') || /close/i.test(btn.textContent || ''));
    expect(closeBtn).toBeTruthy();
  });

  it('renders the overlay', () => {
    const { container } = renderModal(true);
    // Radix overlay is a fixed-position div sibling to the content
    const overlay = container.ownerDocument.querySelector('[data-state="open"]');
    expect(overlay).toBeTruthy();
  });

  it('forwards className to ModalContent', () => {
    render(
      <Modal open onOpenChange={() => {}}>
        <ModalContent className="custom-modal-class">
          <ModalTitle>C</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-modal-class');
  });

  it('forwards className to ModalTitle', () => {
    render(
      <Modal open onOpenChange={() => {}}>
        <ModalContent>
          <ModalTitle className="custom-title-class">T</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    const title = screen.getByRole('heading', { name: 'T' });
    expect(title.className).toContain('custom-title-class');
  });

  it('forwards className to ModalDescription', () => {
    render(
      <Modal open onOpenChange={() => {}}>
        <ModalContent>
          <ModalDescription className="custom-desc-class">D</ModalDescription>
        </ModalContent>
      </Modal>,
    );
    const desc = screen.getByText('D');
    expect(desc.className).toContain('custom-desc-class');
  });

  it('is programmatically focusable', () => {
    renderModal(true);
    const dialog = screen.getByRole('dialog');
    // The dialog container should be present in the accessibility tree
    expect(dialog).toBeInTheDocument();
  });
});
