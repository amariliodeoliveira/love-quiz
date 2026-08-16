// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { patchJson } = vi.hoisted(() => ({ patchJson: vi.fn() }));

vi.mock("@/lib/http", () => ({
  getJson: vi.fn(),
  patchJson,
}));

import CountdownForm from "./CountdownForm";

describe("CountdownForm", () => {
  it("recovers from a network failure instead of remaining in its saving state", async () => {
    const user = userEvent.setup();
    patchJson.mockRejectedValueOnce(new Error("Network unavailable"));
    render(
      <CountdownForm
        initial={{
          label: "Together again in",
          location: "Fortaleza",
          timeZone: "America/Fortaleza",
          targetAtIso: "2026-09-01T15:00:00.000Z",
        }}
        onCancel={vi.fn()}
        onDirtyChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't save the countdown",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });
});
