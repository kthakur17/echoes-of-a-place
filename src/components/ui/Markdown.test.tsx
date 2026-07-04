import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "@/components/ui/Markdown";

describe("Markdown", () => {
  it("renders headings, paragraphs, and lists", () => {
    render(
      <Markdown
        text={"Imagine standing on the ghats at sunrise.\n\n## The River Remembers\n\n- first tradition\n- second tradition"}
      />,
    );
    expect(screen.getByRole("heading", { name: "The River Remembers" })).toBeInTheDocument();
    expect(screen.getByText(/Imagine standing on the ghats/)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders bold and italic inline formatting", () => {
    render(<Markdown text={"A **sacred** river and an *ancient* city."} />);
    expect(screen.getByText("sacred").tagName).toBe("STRONG");
    expect(screen.getByText("ancient").tagName).toBe("EM");
  });

  it("renders raw HTML as inert text, never as markup", () => {
    render(<Markdown text={'<img src=x onerror="alert(1)"> hello'} />);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });
});
