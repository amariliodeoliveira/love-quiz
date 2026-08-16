// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CardFormModal from "./CardFormModal";

describe("CardFormModal", () => {
  it("keeps a dirty card open until the user explicitly discards it", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CardFormModal onClose={onClose} onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Add card" })).toHaveFocus();

    await user.type(
      screen.getByRole("textbox", { name: "Question or dare" }),
      "A question",
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("dialog", { name: "Discard unsaved changes?" }),
    ).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(
      screen.queryByText("Discard unsaved changes?"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows a retry message when its save callback fails", async () => {
    const user = userEvent.setup();
    render(
      <CardFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(false)}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Question or dare" }),
      "A question",
    );
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't save your card",
    );
  });
});
