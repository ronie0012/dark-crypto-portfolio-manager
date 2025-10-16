import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single transaction by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const transaction = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, parseInt(id)))
        .limit(1);

      if (transaction.length === 0) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    // List transactions with filtering, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const transactionType = searchParams.get('transactionType');
    const cryptoSymbol = searchParams.get('cryptoSymbol');

    const conditions = [];

    // Filter by userId
    if (userId) {
      conditions.push(eq(transactions.userId, userId));
    }

    // Filter by transactionType
    if (transactionType) {
      conditions.push(eq(transactions.transactionType, transactionType));
    }

    // Filter by cryptoSymbol
    if (cryptoSymbol) {
      conditions.push(eq(transactions.cryptoSymbol, cryptoSymbol));
    }

    // Search across cryptoSymbol, cryptoName, and notes
    if (search) {
      conditions.push(
        or(
          like(transactions.cryptoSymbol, `%${search}%`),
          like(transactions.cryptoName, `%${search}%`),
          like(transactions.notes, `%${search}%`)
        )
      );
    }

    // Build query with conditions
    let query = db.select().from(transactions);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);

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
      transactionType,
      amount,
      pricePerUnit,
      totalValue,
      transactionDate,
      notes,
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

    if (!transactionType) {
      return NextResponse.json(
        { error: 'transactionType is required', code: 'MISSING_TRANSACTION_TYPE' },
        { status: 400 }
      );
    }

    if (transactionType !== 'buy' && transactionType !== 'sell') {
      return NextResponse.json(
        { error: 'transactionType must be either "buy" or "sell"', code: 'INVALID_TRANSACTION_TYPE' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (pricePerUnit === undefined || pricePerUnit === null) {
      return NextResponse.json(
        { error: 'pricePerUnit is required', code: 'MISSING_PRICE_PER_UNIT' },
        { status: 400 }
      );
    }

    if (typeof pricePerUnit !== 'number' || pricePerUnit <= 0) {
      return NextResponse.json(
        { error: 'pricePerUnit must be a positive number', code: 'INVALID_PRICE_PER_UNIT' },
        { status: 400 }
      );
    }

    if (totalValue === undefined || totalValue === null) {
      return NextResponse.json(
        { error: 'totalValue is required', code: 'MISSING_TOTAL_VALUE' },
        { status: 400 }
      );
    }

    if (typeof totalValue !== 'number' || totalValue <= 0) {
      return NextResponse.json(
        { error: 'totalValue must be a positive number', code: 'INVALID_TOTAL_VALUE' },
        { status: 400 }
      );
    }

    if (!transactionDate) {
      return NextResponse.json(
        { error: 'transactionDate is required', code: 'MISSING_TRANSACTION_DATE' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(transactionDate)) {
      return NextResponse.json(
        { error: 'transactionDate must be a valid Unix timestamp (integer)', code: 'INVALID_TRANSACTION_DATE' },
        { status: 400 }
      );
    }

    // Create new transaction
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId: userId.trim(),
        cryptoSymbol: cryptoSymbol.trim(),
        cryptoName: cryptoName.trim(),
        transactionType,
        amount,
        pricePerUnit,
        totalValue,
        transactionDate,
        notes: notes ? notes.trim() : null,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      cryptoSymbol,
      cryptoName,
      transactionType,
      amount,
      pricePerUnit,
      totalValue,
      transactionDate,
      notes,
    } = body;

    // Validate transactionType if provided
    if (transactionType !== undefined && transactionType !== 'buy' && transactionType !== 'sell') {
      return NextResponse.json(
        { error: 'transactionType must be either "buy" or "sell"', code: 'INVALID_TRANSACTION_TYPE' },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate pricePerUnit if provided
    if (pricePerUnit !== undefined && (typeof pricePerUnit !== 'number' || pricePerUnit <= 0)) {
      return NextResponse.json(
        { error: 'pricePerUnit must be a positive number', code: 'INVALID_PRICE_PER_UNIT' },
        { status: 400 }
      );
    }

    // Validate totalValue if provided
    if (totalValue !== undefined && (typeof totalValue !== 'number' || totalValue <= 0)) {
      return NextResponse.json(
        { error: 'totalValue must be a positive number', code: 'INVALID_TOTAL_VALUE' },
        { status: 400 }
      );
    }

    // Validate transactionDate if provided
    if (transactionDate !== undefined && !Number.isInteger(transactionDate)) {
      return NextResponse.json(
        { error: 'transactionDate must be a valid Unix timestamp (integer)', code: 'INVALID_TRANSACTION_DATE' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (cryptoSymbol !== undefined) updates.cryptoSymbol = cryptoSymbol.trim();
    if (cryptoName !== undefined) updates.cryptoName = cryptoName.trim();
    if (transactionType !== undefined) updates.transactionType = transactionType;
    if (amount !== undefined) updates.amount = amount;
    if (pricePerUnit !== undefined) updates.pricePerUnit = pricePerUnit;
    if (totalValue !== undefined) updates.totalValue = totalValue;
    if (transactionDate !== undefined) updates.transactionDate = transactionDate;
    if (notes !== undefined) updates.notes = notes ? notes.trim() : null;

    // Update transaction
    const updated = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction
    const deleted = await db
      .delete(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Transaction deleted successfully',
        transaction: deleted[0],
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