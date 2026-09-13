import { NextRequest, NextResponse } from 'next/server';
import { generateCustomerDataExport } from '../../../../lib/core/privacy/data-export';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const customerId = req.nextUrl.searchParams.get('customerId') || 'customer_101';
  const manifest = generateCustomerDataExport(customerId);
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: manifest });
}
