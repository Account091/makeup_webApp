import { MarketplaceSearchQueryV85 } from "../marketplace/marketplace-types";
import { executeMarketplaceSearch, MarketplaceSearchResult } from "../marketplace/marketplace-search-engine";

export interface AIDiscoveryResponse {
  queryParsed: MarketplaceSearchQueryV85;
  searchResult: MarketplaceSearchResult;
  aiExplanation: string;
}

/**
 * AI Natural Language Marketplace Discovery Parser.
 * Converts natural customer search prompts (e.g. "Bridal makeup artist in Jaipur for Oct 18")
 * into structured search criteria and delegates candidate retrieval strictly to the deterministic ranking engine.
 */
export function parseAndExecuteAIDiscovery(promptText: string): AIDiscoveryResponse {
  const text = promptText.toLowerCase();
  const query: MarketplaceSearchQueryV85 = {
    sort: "RECOMMENDED",
    page: 1,
    pageSize: 10
  };

  // 1. Detect Location
  if (text.includes("jaipur")) query.locationId = "jaipur";
  else if (text.includes("jodhpur")) query.locationId = "jodhpur";
  else if (text.includes("udaipur")) query.locationId = "udaipur";

  // 2. Detect Service Category
  if (text.includes("bridal") || text.includes("wedding")) query.serviceCategory = "bridal";
  else if (text.includes("party") || text.includes("engagement")) query.serviceCategory = "party";
  else if (text.includes("hair")) query.serviceCategory = "hair";

  // 3. Detect Max Price if mentioned (e.g., "under 20000" or "under ₹20,000")
  const priceMatch = text.match(/under\s*₹?\s*(\d+[\d,]*)/i);
  if (priceMatch && priceMatch[1]) {
    query.maxPrice = Number(priceMatch[1].replace(/,/g, ""));
  }

  // 4. Execute Deterministic Marketplace Search Engine
  const searchResult = executeMarketplaceSearch(query);

  // 5. Generate Transparent AI Explanation (strictly based on actual search results)
  let aiExplanation = `Found ${searchResult.totalEligibleCount} verified artist listing(s) matching your request. Results are ranked by verified trust, client reviews, and calendar availability.`;
  
  if (searchResult.results.length === 0) {
    aiExplanation = `No exact verified matches found for your requested query. Consider broadening location or service parameters.`;
  }

  return {
    queryParsed: query,
    searchResult,
    aiExplanation
  };
}

export function parseNaturalLanguageSearch(promptText: string) {
  const res = parseAndExecuteAIDiscovery(promptText);
  return {
    query: res.queryParsed,
    aiExplanation: res.aiExplanation,
    searchResult: res.searchResult,
  };
}
