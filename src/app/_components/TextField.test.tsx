// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import TextField from "./TextField";

describe("TextField", () => {
  it("keeps ordinary fields native", () => {
    render(<TextField aria-label="Display name" placeholder="e.g. Alex" />);

    expect(
      screen.getByRole("textbox", { name: "Display name" }),
    ).toHaveAttribute("placeholder", "e.g. Alex");
  });

  it("allows a password to be revealed without changing its value", async () => {
    const user = userEvent.setup();
    render(
      <TextField aria-label="Password" type="password" defaultValue="secret" />,
    );

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("secret");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
