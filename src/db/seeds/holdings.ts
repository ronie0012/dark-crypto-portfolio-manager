import { db } from '@/db';
import { holdings } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const sixMonthsAgoTimestamp = currentTimestamp - 15552000;

    const sampleHoldings = [
        {
            userId: 'user_demo_001',
            cryptoSymbol: 'BTC',
            cryptoName: 'Bitcoin',
            amount: 0.5,
            averagePurchasePrice: 45000,
            totalInvested: 22500,
            currentPrice: 52000,
            lastUpdated: currentTimestamp,
            createdAt: sixMonthsAgoTimestamp,
        },
        {
            userId: 'user_demo_001',
            cryptoSymbol: 'ETH',
            cryptoName: 'Ethereum',
            amount: 5,
            averagePurchasePrice: 2800,
            totalInvested: 14000,
            currentPrice: 3100,
            lastUpdated: currentTimestamp,
            createdAt: sixMonthsAgoTimestamp,
        },
        {
            userId: 'user_demo_001',
            cryptoSymbol: 'SOL',
            cryptoName: 'Solana',
            amount: 100,
            averagePurchasePrice: 95,
            totalInvested: 9500,
            currentPrice: 110,
            lastUpdated: currentTimestamp,
            createdAt: sixMonthsAgoTimestamp,
        },
        {
            userId: 'user_demo_001',
            cryptoSymbol: 'ADA',
            cryptoName: 'Cardano',
            amount: 5000,
            averagePurchasePrice: 0.45,
            totalInvested: 2250,
            currentPrice: 0.58,
            lastUpdated: currentTimestamp,
            createdAt: sixMonthsAgoTimestamp,
        },
    ];

    await db.insert(holdings).values(sampleHoldings);
    
    console.log('✅ Holdings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});