import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssetBrowser from "@/components/AssetBrowser";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt ?? "")} />,
}));

const MODELS = [
  { id: "villa", name: "Nile Villa", category: "architecture", url: "/models/villa.glb", thumbnail: "/t/villa.png", size: "12 MB", license: "CC0", compatibleWith: ["archviz"] },
  { id: "chair", name: "Lotus Chair", category: "furniture", url: "/models/chair.glb", thumbnail: "/t/chair.png", size: "3 MB", license: "CC0", compatibleWith: ["archviz"] },
];

function mockFetchOnce(payload: unknown, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok,
    json: async () => payload,
  } as Response);
}

describe("AssetBrowser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then renders the fetched models", async () => {
    mockFetchOnce({ models: MODELS });
    render(<AssetBrowser onModelSelected={() => {}} />);

    expect(screen.getByText("Loading assets…")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Nile Villa")).toBeInTheDocument());
    expect(screen.getByText("Lotus Chair")).toBeInTheDocument();
    expect(screen.getByText("architecture • 12 MB")).toBeInTheDocument();
  });

  it("filters by search query and category", async () => {
    const user = userEvent.setup();
    mockFetchOnce({ models: MODELS });
    render(<AssetBrowser onModelSelected={() => {}} />);
    await waitFor(() => expect(screen.getByText("Nile Villa")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText("Search assets..."), "lotus");
    expect(screen.queryByText("Nile Villa")).not.toBeInTheDocument();
    expect(screen.getByText("Lotus Chair")).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Search assets..."));
    await user.click(screen.getByRole("button", { name: "furniture" }));
    expect(screen.queryByText("Nile Villa")).not.toBeInTheDocument();
    expect(screen.getByText("Lotus Chair")).toBeInTheDocument();
  });

  it("notifies the parent with url + id when a model is selected", async () => {
    const user = userEvent.setup();
    const onModelSelected = vi.fn();
    mockFetchOnce({ models: MODELS });
    render(<AssetBrowser onModelSelected={onModelSelected} />);
    await waitFor(() => expect(screen.getByText("Nile Villa")).toBeInTheDocument());

    const item = screen.getByText("Nile Villa").closest("button");
    expect(item).not.toBeNull();
    await user.click(item as HTMLElement);
    expect(onModelSelected).toHaveBeenCalledWith("/models/villa.glb", "villa");
  });

  it("shows an honest error when the catalogue request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("backend down"));
    render(<AssetBrowser onModelSelected={() => {}} />);

    await waitFor(() =>
      expect(screen.getByText("Error: backend down")).toBeInTheDocument()
    );
  });

  it("shows an empty state when no model matches", async () => {
    const user = userEvent.setup();
    mockFetchOnce({ models: MODELS });
    render(<AssetBrowser onModelSelected={() => {}} />);
    await waitFor(() => expect(screen.getByText("Nile Villa")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText("Search assets..."), "zzz-no-match");
    expect(screen.getByText("No assets found.")).toBeInTheDocument();
  });

  it("scopes category buttons to the list region", async () => {
    mockFetchOnce({ models: MODELS });
    const { container } = render(<AssetBrowser onModelSelected={() => {}} />);
    await waitFor(() => expect(screen.getByText("Nile Villa")).toBeInTheDocument());
    const region = within(container as HTMLElement);
    expect(region.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(region.getByRole("button", { name: "architecture" })).toBeInTheDocument();
  });
});
