/**
 * cost-estimator.service.ts
 * NestJS service — Automated Cost Estimator (material count → PDF)
 * HEXA Studio — Sprint S022.4
 *
 * Extends MaterialLibrary.ts cost calculation with scene analysis.
 * Generates PDF material takeoffs from 3D scene surface data.
 * Self-hosted, offline — uses pdfkit (no cloud/SaaS).
 */
import { Injectable, Logger } from "@nestjs/common";
import { getMaterial, getAllMaterials } from "./materials-data";
import PDFDocument from "pdfkit";

@Injectable()
export class CostEstimatorService {
  private readonly logger = new Logger(CostEstimatorService.name);

  constructor() {}

  /**
   * Get Egyptian materials pricing lookup
   */
  getPricing() {
    return getAllMaterials().reduce<Record<string, number>>((acc, m) => {
      acc[m.id] = m.basePriceEGP;
      return acc;
    }, {});
  }

  /**
   * List all Egyptian materials with pricing info
   */
  listMaterials() {
    return getAllMaterials().map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      basePriceEGP: m.basePriceEGP,
      unit: m.unit,
      description: m.description,
      culturalNote: m.culturalNote,
    }));
  }

  /**
   * Calculate total cost for a scene
   * @param surfaceAreas — Record<materialId, areaSqm>
   * @returns cost estimate with per-material breakdown
   */
  calculateSceneCost(surfaceAreas: Record<string, number>) {
    const lookup = getAllMaterials().reduce<Record<string, number>>((acc, m) => {
      acc[m.id] = m.basePriceEGP;
      return acc;
    }, {});
    const breakdown: Array<{
      materialId: string;
      name: string;
      areaSqm: number;
      unitPriceEGP: number;
      totalEGP: number;
    }> = [];

    let totalAreaSqm = 0;
    let totalCostEGP = 0;

    for (const [materialId, areaSqm] of Object.entries(surfaceAreas)) {
      const material = getMaterial(materialId);
      if (!material) continue;
      const unitPrice = lookup[materialId] || 0;
      const total = unitPrice * areaSqm;
      breakdown.push({
        materialId,
        name: material.name,
        areaSqm,
        unitPriceEGP: unitPrice,
        totalEGP: Math.round(total),
      });
      totalAreaSqm += areaSqm;
      totalCostEGP += total;
    }

    return {
      success: true,
      summary: {
        totalAreaSqm: Math.round(totalAreaSqm * 100) / 100,
        totalCostEGP: Math.round(totalCostEGP),
        materialsUsed: breakdown.length,
      },
      breakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a PDF material takeoff
   * @param surfaceAreas — Record<materialId, areaSqm>
   * @param projectName — optional project name
   * @returns PDF buffer
   */
  async generatePdf(
    surfaceAreas: Record<string, number>,
    projectName: string = "HEXA Studio Cost Estimate"
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const cost = this.calculateSceneCost(surfaceAreas);
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // Header
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .fillColor("#D4AF37")
          .text(projectName, { align: "center" });

        doc
          .fontSize(12)
          .font("Helvetica")
          .fillColor("#666666")
          .text("Material Takeoff Report", { align: "center" })
          .moveDown(0.5);

        doc
          .fontSize(10)
          .fillColor("#999999")
          .text(`Generated: ${new Date().toLocaleString("en-US")}`)
          .text(`Project ID: ${projectName.replace(/\s+/g, "-").toLowerCase()}`)
          .moveDown(1);

        // Summary
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("Summary", { underline: true })
          .moveDown(0.3);

        doc
          .fontSize(11)
          .font("Helvetica")
          .list([
            `Total Surface Area: ${cost.summary.totalAreaSqm} m²`,
            `Materials Used: ${cost.summary.materialsUsed}`,
            `Total Estimated Cost: ${cost.summary.totalCostEGP.toLocaleString()} EGP`,
          ]);
        doc.moveDown(1);

        // Breakdown table
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("Material Breakdown", { underline: true })
          .moveDown(0.3);

        // Table headers
        const tableTop = doc.y;
        const headers = ["Material", "Area (m²)", "Unit Price (EGP)", "Total (EGP)"];
        const columnWidths = [200, 80, 90, 80];
        const startX = 50;

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#000000");

        let xPos = startX;
        headers.forEach((header, i) => {
          doc.text(header, xPos, tableTop, { width: columnWidths[i] });
          xPos += columnWidths[i];
        });

        // Table rows
        doc.font("Helvetica").fontSize(10);
        let yPos = tableTop + 25;
        let currentLineColor = "#E0E0E0";

        // Header separator line
        doc
          .moveTo(startX, yPos)
          .lineTo(startX + 450, yPos)
          .strokeColor("#D4AF37")
          .lineWidth(1)
          .stroke();
        yPos += 10;

        cost.breakdown.forEach((item) => {
          xPos = startX;
          const rowData = [
            item.name,
            item.areaSqm.toFixed(2),
            item.unitPriceEGP.toLocaleString(),
            item.totalEGP.toLocaleString(),
          ];

          rowData.forEach((val, i) => {
            doc.text(val, xPos, yPos, { width: columnWidths[i] });
            xPos += columnWidths[i];
          });

          yPos += 20;
          doc
            .moveTo(startX, yPos)
            .lineTo(startX + 450, yPos)
            .strokeColor(currentLineColor)
            .lineWidth(0.5)
            .stroke();
          yPos += 10;

          currentLineColor = currentLineColor === "#E0E0E0" ? "#F0F0F0" : "#E0E0E0";
        });

        // Footer
        doc
          .switchToPage(doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1);
        doc
          .fontSize(10)
          .fillColor("#999999")
          .text(
            "Prices include VAT. Based on local Egyptian material market rates.",
            50,
            doc.page.height - 50,
            { align: "center" }
          )
          .text(
            "HEXA Studio — Architectural Visualization Studio | Self-hosted",
            50,
            doc.page.height - 35,
            { align: "center" }
          );

        doc.end();
      } catch (err: unknown) {
        this.logger.error(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
        reject(err);
      }
    });
  }
}
