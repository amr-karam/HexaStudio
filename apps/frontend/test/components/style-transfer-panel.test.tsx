import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StyleTransferPanel from "@/components/StyleTransferPanel";
import { getAllMaterials } from "@/lib/materials/MaterialLibrary";

const MATERIALS = getAllMaterials();
const FIRST = MATERIALS[0];

describe("StyleTransferPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the material catalogue with EGP prices", () => {
    render(<StyleTransferPanel onTextureGenerated={() => {}} />);
    expect(screen.getByText("AI Style Transfer")).toBeInTheDocument();
    const select = screen.getByLabelText("Material") as HTMLSelectElement;
    expect(select.options).toHaveLength(MATERIALS.length);
    expect(select.options[0].text).toBe(`${FIRST.name} (${FIRST.basePriceEGP} EGP)`);
  });

  it("keeps Generate disabled until a prompt is entered", async () => {
    const user = userEvent.setup();
    render(<StyleTransferPanel onTextureGenerated={() => {}} />);
    const generate = screen.getByRole("button", { name: "Generate Texture" });
    expect(generate).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText(/Islamic geometric patterns/),
      "sandstone relief"
    );
    expect(generate).toBeEnabled();
  });

  it("posts the payload and forwards the texture on success", async () => {
    const user = userEvent.setup();
    const onTextureGenerated = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, imageUrl: "https://sd.local/out.png" }),
    } as Response);
    render(<StyleTransferPanel onTextureGenerated={onTextureGenerated} />);

    await user.type(
      screen.getByPlaceholderText(/Islamic geometric patterns/),
      "sandstone relief"
    );
    await user.click(screen.getByRole("button", { name: "Generate Texture" }));

    await waitFor(() =>
      expect(onTextureGenerated).toHaveBeenCalledWith(FIRST.id, "https://sd.local/out.png")
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/style-transfer",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(`"materialId":"${FIRST.id}"`),
      })
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/style-transfer",
      expect.objectContaining({
        body: expect.stringContaining('"prompt":"sandstone relief"'),
      })
    );
  });

  it("shows the backend error when generation fails honestly", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: "SD WebUI unreachable" }),
    } as Response);
    render(<StyleTransferPanel onTextureGenerated={() => {}} />);

    await user.type(
      screen.getByPlaceholderText(/Islamic geometric patterns/),
      "sandstone relief"
    );
    await user.click(screen.getByRole("button", { name: "Generate Texture" }));

    await waitFor(() =>
      expect(screen.getByText("SD WebUI unreachable")).toBeInTheDocument()
    );
  });

  it("shows a network error when the request itself fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("fetch failed"));
    render(<StyleTransferPanel onTextureGenerated={() => {}} />);

    await user.type(
      screen.getByPlaceholderText(/Islamic geometric patterns/),
      "sandstone relief"
    );
    await user.click(screen.getByRole("button", { name: "Generate Texture" }));

    await waitFor(() =>
      expect(screen.getByText("fetch failed")).toBeInTheDocument()
    );
  });

  it("reveals ControlNet options on toggle and sends no controlNet block without an image", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, imageUrl: "https://sd.local/cn.png" }),
    } as Response);
    render(<StyleTransferPanel onTextureGenerated={() => {}} />);

    expect(
      screen.queryByLabelText("ControlNet Processor")
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText(/Use ControlNet/));
    expect(screen.getByLabelText("ControlNet Processor")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate with ControlNet" })
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/Islamic geometric patterns/),
      "depth-guided facade"
    );
    await user.click(
      screen.getByRole("button", { name: "Generate with ControlNet" })
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const sent = JSON.parse(
      (fetchSpy.mock.calls[0][1] as { body: string }).body
    ) as Record<string, unknown>;
    expect(sent).not.toHaveProperty("controlNet");
  });
});
