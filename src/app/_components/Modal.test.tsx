// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Modal from "./Modal";

describe("Modal", () => {
  it("does not dismiss a dialog from a backdrop click by default", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Profile settings">
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("dialog").parentElement!);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeVisible();
  });

  it("allows read-only dialogs to opt into backdrop dismissal", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} dismissOnBackdrop>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("dialog").parentElement!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("allows a backdrop-dismissible read-only panel to omit a redundant close button", () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        dismissOnBackdrop
        showCloseButton={false}
        title="Countdown"
      >
        <p>Content</p>
      </Modal>,
    );

    expect(
      screen.queryByRole("button", { name: "Close dialog" }),
    ).not.toBeInTheDocument();
  });

  it("uses an aria-label when a read-only panel has no visible title", () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        ariaLabel="Countdown"
        dismissOnBackdrop
        showCloseButton={false}
      >
        <p>Content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Countdown" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Countdown" }),
    ).not.toBeInTheDocument();
  });

  it("requests dismissal from Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Profile settings">
        <button type="button">Action</button>
      </Modal>,
    );

    fireEvent.keyDown(globalThis.window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not steal focus from a form control marked for automatic focus", () => {
    render(
      <Modal open onClose={vi.fn()} title="Add card">
        <textarea aria-label="Question or dare" data-modal-initial-focus />
      </Modal>,
    );

    expect(
      screen.getByRole("textbox", { name: "Question or dare" }),
    ).toHaveFocus();
  });
});
