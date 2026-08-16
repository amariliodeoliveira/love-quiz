import { describe, expect, it } from "vitest";

import { getCalendarPlacement } from "./DateTimePicker";

describe("getCalendarPlacement", () => {
  it("opens below the trigger when the lower viewport has more room", () => {
    expect(getCalendarPlacement({ top: 120, bottom: 160 }, 700)).toEqual(
      "bottom",
    );
  });

  it("opens above the trigger when the lower viewport is constrained", () => {
    expect(getCalendarPlacement({ top: 342, bottom: 388 }, 652)).toEqual("top");
  });
});
