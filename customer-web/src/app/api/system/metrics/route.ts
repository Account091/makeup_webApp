import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSummary } from '../../../../lib/core/observability/metrics-collector';
import { getAIObservabilitySummary } from '../../../../lib/core/observability/ai-observability';
import { getSheetsObservabilityMetrics } from '../../../../lib/core/observability/sheets-observability';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const systemMetrics = getMetricsSummary();
  const aiMetrics = getAIObservabilitySummary();
  const sheetsMetrics = getSheetsObservabilityMetrics();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: {
      system: systemMetrics,
      ai: aiMetrics,
      sheets: sheetsMetrics,
    },
  });
}
