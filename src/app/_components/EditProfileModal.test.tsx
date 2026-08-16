// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EditProfileModal from "./EditProfileModal";

function renderModal() {
  return render(
    <EditProfileModal
      initialDisplayName="Alex"
      initialAvatarColor="pink"
      initialAvatarEmoji={null}
      initialAvatarEmojiOptions={null}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
}

describe("EditProfileModal custom avatar emoji", () => {
  it("opens without placing the display name into edit mode", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "Profile settings" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("textbox", { name: "Display name" }),
    ).not.toHaveFocus();
  });

  it("keeps the picker grid to 30 slots, including the add-emoji control", () => {
    renderModal();

    expect(
      screen
        .getByRole("group", { name: "Avatar emoji" })
        .querySelectorAll("button"),
    ).toHaveLength(30);
  });

  it("updates the avatar preview as color and emoji choices change", async () => {
    const user = userEvent.setup();
    renderModal();

    expect(
      screen.getByRole("img", { name: "Avatar preview: A on pink background" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Use blue avatar color" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Use 🦊 as the avatar emoji" }),
    );

    expect(
      screen.getByRole("img", {
        name: "Avatar preview: 🦊 on blue background",
      }),
    ).toBeVisible();
  });

  it("moves every selected emoji to the first picker position", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Use 🦊 as the avatar emoji" }),
    );

    const pickerButtons = screen
      .getByRole("group", { name: "Avatar emoji" })
      .querySelectorAll("button");
    expect(pickerButtons[0]).toHaveAccessibleName("Add a custom avatar emoji");
    expect(pickerButtons[1]).toHaveAccessibleName("Use 🦊 as the avatar emoji");
  });

  it("replaces the add button with a focused emoji field", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Add a custom avatar emoji" }),
    );

    const input = screen.getByRole("textbox", {
      name: "Add a custom avatar emoji",
    });
    expect(input).toBeVisible();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("placeholder", "😊");
  });

  it("applies one valid emoji immediately and ignores plain text", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Add a custom avatar emoji" }),
    );
    const input = screen.getByRole("textbox", {
      name: "Add a custom avatar emoji",
    });

    await user.type(input, "x");
    expect(input).toHaveValue("");

    // Operating-system emoji pickers deliver the completed Unicode grapheme in one
    // input event; jsdom's key simulation emits surrogate halves instead.
    fireEvent.change(input, { target: { value: "🦉" } });
    expect(
      screen.queryByRole("textbox", { name: "Add a custom avatar emoji" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use 🦉 as the avatar emoji" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
