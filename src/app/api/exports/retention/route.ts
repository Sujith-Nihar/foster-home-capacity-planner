import { NextResponse } from "next/server";

import {
  getRetentionExportData,
  retentionExportFilename,
} from "@/lib/data/exports";
import { getActiveReportingDate } from "@/lib/supabase/server";
import { MAX_EXPORT_ROWS, sanitizeExportFilename, serializeCsv } from "@/lib/utils/csv";
import { normalizeSearchParams } from "@/lib/validation/search-params";

function searchParamsFromRequest(request: Request): Record<string, string | undefined> {
  const url = new URL(request.url);
  return normalizeSearchParams(Object.fromEntries(url.searchParams.entries()));
}

export async function GET(request: Request) {
  try {
    const searchParams = searchParamsFromRequest(request);
    const { rows, totalCount } = await getRetentionExportData(searchParams);

    if (totalCount > MAX_EXPORT_ROWS) {
      return NextResponse.json(
        { error: `Export exceeds the maximum of ${MAX_EXPORT_ROWS} rows.` },
        { status: 413 },
      );
    }

    const reportingDate = await getActiveReportingDate();
    const filename = sanitizeExportFilename(retentionExportFilename(reportingDate));
    const csv = serializeCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export retention providers." }, { status: 500 });
  }
}
