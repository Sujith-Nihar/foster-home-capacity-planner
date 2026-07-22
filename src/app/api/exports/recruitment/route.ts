import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Recruitment CSV export is not implemented yet." },
    { status: 501 },
  );
}
