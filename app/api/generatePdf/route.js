export const runtime = "nodejs";

import { generatePDF } from "../../lib/pdfGenerator";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { htmlContent } = await request.json();

    const pdfBuffer = await generatePDF(htmlContent);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "attachment; filename=SpendPath_transactions.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);

    return NextResponse.json(
      { message: "Error generating PDF" },
      { status: 500 }
    );
  }
}