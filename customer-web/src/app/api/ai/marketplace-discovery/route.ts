import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "../../../../lib/ai/marketplace-ai-discovery";
import { searchMarketplaceV85 } from "../../../../lib/marketplace/marketplace-search-engine";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.query;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt string is required" },
        { status: 400 }
      );
    }

    const { query: structuredQuery, aiExplanation } = parseNaturalLanguageSearch(prompt);
    
    const finalQuery = {
      ...structuredQuery,
      page: body.page || structuredQuery.page || 1,
      pageSize: body.pageSize || body.limit || structuredQuery.pageSize || 10,
    };


    const searchResult = searchMarketplaceV85(finalQuery);

    return NextResponse.json({
      success: true,
      naturalPrompt: prompt,
      parsedQuery: finalQuery,
      aiExplanation,
      searchResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
