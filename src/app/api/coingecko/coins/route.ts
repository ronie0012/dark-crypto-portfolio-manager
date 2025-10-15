import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids"); // comma-separated coin ids
    const search = searchParams.get("search");
    const perPage = searchParams.get("per_page") || "100";
    const page = searchParams.get("page") || "1";

    let url: string;
    
    if (ids) {
      // Fetch specific coins by IDs
      url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
    } else if (search) {
      // Search for coins
      url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(search)}`;
    } else {
      // Fetch top coins by market cap
      url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
    }

    const response = await fetch(url, {
      headers: {
        "x-cg-demo-api-key": COINGECKO_API_KEY || "",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching coins:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin data" },
      { status: 500 }
    );
  }
}