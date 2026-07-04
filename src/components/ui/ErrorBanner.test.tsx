import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

describe("ErrorBanner", () => {
  it("announces the error via role=alert", () => {
    render(<ErrorBanner message="The AI service is temporarily unavailable." />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The AI service is temporarily unavailable.",
    );
  });

  it("shows a retry button only when onRetry is provided, and wires it up", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorBanner message="Oops" />);
    expect(screen.queryByRole("button")).toBeNull();

    rerender(<ErrorBanner message="Oops" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
