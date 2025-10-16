import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { holdings } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single holding by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const holding = await db
        .select()
        .from(holdings)
        .where(eq(holdings.id, parseInt(id)))
        .limit(1);

      if (holding.length === 0) {
        return NextResponse.json(
          { error: 'Holding not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(holding[0], { status: 200 });
    }

    // List holdings with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    // Build where conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(holdings.userId, userId));
    }

    if (search) {
      conditions.push(
        or(
          like(holdings.cryptoSymbol, `%${search}%`),
          like(holdings.cryptoName, `%${search}%`)
        )
      );
    }

    // Build query with conditions
    let query = db.select().from(holdings);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as typeof query;
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      cryptoSymbol,
      cryptoName,
      amount,
      averagePurchasePrice,
      totalInvested,
      currentPrice,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!cryptoSymbol) {
      return NextResponse.json(
        { error: 'cryptoSymbol is required', code: 'MISSING_CRYPTO_SYMBOL' },
        { status: 400 }
      );
    }

    if (!cryptoName) {
      return NextResponse.json(
        { error: 'cryptoName is required', code: 'MISSING_CRYPTO_NAME' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (averagePurchasePrice === undefined || averagePurchasePrice === null) {
      return NextResponse.json(
        { error: 'averagePurchasePrice is required', code: 'MISSING_AVERAGE_PURCHASE_PRICE' },
        { status: 400 }
      );
    }

    if (totalInvested === undefined || totalInvested === null) {
      return NextResponse.json(
        { error: 'totalInvested is required', code: 'MISSING_TOTAL_INVESTED' },
        { status: 400 }
      );
    }

    if (currentPrice === undefined || currentPrice === null) {
      return NextResponse.json(
        { error: 'currentPrice is required', code: 'MISSING_CURRENT_PRICE' },
        { status: 400 }
      );
    }

    // Validate positive numbers
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (averagePurchasePrice <= 0) {
      return NextResponse.json(
        { error: 'averagePurchasePrice must be a positive number', code: 'INVALID_AVERAGE_PURCHASE_PRICE' },
        { status: 400 }
      );
    }

    if (totalInvested <= 0) {
      return NextResponse.json(
        { error: 'totalInvested must be a positive number', code: 'INVALID_TOTAL_INVESTED' },
        { status: 400 }
      );
    }

    if (currentPrice <= 0) {
      return NextResponse.json(
        { error: 'currentPrice must be a positive number', code: 'INVALID_CURRENT_PRICE' },
        { status: 400 }
      );
    }

    // Create timestamps
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Insert new holding
    const newHolding = await db
      .insert(holdings)
      .values({
        userId: userId.trim(),
        cryptoSymbol: cryptoSymbol.trim(),
        cryptoName: cryptoName.trim(),
        amount,
        averagePurchasePrice,
        totalInvested,
        currentPrice,
        lastUpdated: currentTimestamp,
        createdAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newHolding[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if holding exists
    const existingHolding = await db
      .select()
      .from(holdings)
      .where(eq(holdings.id, parseInt(id)))
      .limit(1);

    if (existingHolding.length === 0) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      cryptoSymbol,
      cryptoName,
      amount,
      averagePurchasePrice,
      totalInvested,
      currentPrice,
    } = body;

    // Validate positive numbers if provided
    if (amount !== undefined && amount !== null && amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (averagePurchasePrice !== undefined && averagePurchasePrice !== null && averagePurchasePrice <= 0) {
      return NextResponse.json(
        { error: 'averagePurchasePrice must be a positive number', code: 'INVALID_AVERAGE_PURCHASE_PRICE' },
        { status: 400 }
      );
    }

    if (totalInvested !== undefined && totalInvested !== null && totalInvested <= 0) {
      return NextResponse.json(
        { error: 'totalInvested must be a positive number', code: 'INVALID_TOTAL_INVESTED' },
        { status: 400 }
      );
    }

    if (currentPrice !== undefined && currentPrice !== null && currentPrice <= 0) {
      return NextResponse.json(
        { error: 'currentPrice must be a positive number', code: 'INVALID_CURRENT_PRICE' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {
      lastUpdated: Math.floor(Date.now() / 1000),
    };

    if (cryptoSymbol !== undefined) {
      updates.cryptoSymbol = cryptoSymbol.trim();
    }

    if (cryptoName !== undefined) {
      updates.cryptoName = cryptoName.trim();
    }

    if (amount !== undefined && amount !== null) {
      updates.amount = amount;
    }

    if (averagePurchasePrice !== undefined && averagePurchasePrice !== null) {
      updates.averagePurchasePrice = averagePurchasePrice;
    }

    if (totalInvested !== undefined && totalInvested !== null) {
      updates.totalInvested = totalInvested;
    }

    if (currentPrice !== undefined && currentPrice !== null) {
      updates.currentPrice = currentPrice;
    }

    // Update holding
    const updatedHolding = await db
      .update(holdings)
      .set(updates)
      .where(eq(holdings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedHolding[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if holding exists
    const existingHolding = await db
      .select()
      .from(holdings)
      .where(eq(holdings.id, parseInt(id)))
      .limit(1);

    if (existingHolding.length === 0) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }

    // Delete holding
    const deletedHolding = await db
      .delete(holdings)
      .where(eq(holdings.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Holding deleted successfully',
        holding: deletedHolding[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}