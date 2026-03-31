import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: "EMAIL BROADCAST SERVICE HAS BEEN DECOMMISSIONED. USE WHATSAPP BROADCAST CENTER INSTEAD." }, 
    { status: 410 }
  );
}
