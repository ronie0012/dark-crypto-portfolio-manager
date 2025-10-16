// MongoDB initialization script
db = db.getSiblingDB('crypto_app');

// Create collections
db.createCollection('users');
db.createCollection('portfolios');
db.createCollection('transactions');
db.createCollection('analytics');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.portfolios.createIndex({ "userId": 1 });
db.transactions.createIndex({ "userId": 1, "timestamp": -1 });
db.analytics.createIndex({ "userId": 1, "date": -1 });

// Insert sample data (optional)
db.users.insertOne({
    _id: ObjectId(),
    email: "demo@example.com",
    name: "Demo User",
    createdAt: new Date(),
    updatedAt: new Date()
});

print("Database initialized successfully!");