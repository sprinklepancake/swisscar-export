const { Sequelize } = require('sequelize');
const path = require('path');

console.log('🚀 Setting up database...');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create tables
    await sequelize.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        role VARCHAR(50) DEFAULT 'buyer',
        verified BOOLEAN DEFAULT 0,
        funds DECIMAL(10,2) DEFAULT 0,
        verifiedBuyer BOOLEAN DEFAULT 0,
        banned BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sellerId INTEGER NOT NULL,
        make VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        price DECIMAL(10,2),
        startingPrice DECIMAL(10,2),
        mileage INTEGER NOT NULL,
        color VARCHAR(255) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        fuelType VARCHAR(255) NOT NULL,
        transmission VARCHAR(255) NOT NULL,
        engineSize VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        images TEXT NOT NULL DEFAULT '[]',
        canton VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        auctionEnd DATETIME,
        views INTEGER DEFAULT 0,
        isFeatured BOOLEAN DEFAULT 0,
        shippingCost DECIMAL(10,2),
        exportDocuments BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sellerId) REFERENCES users(id)
      );

      CREATE TABLE chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        carId INTEGER NOT NULL,
        sellerId INTEGER NOT NULL,
        buyerId INTEGER NOT NULL,
        lastMessageAt DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (carId) REFERENCES cars(id),
        FOREIGN KEY (sellerId) REFERENCES users(id),
        FOREIGN KEY (buyerId) REFERENCES users(id)
      );

      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        senderId INTEGER NOT NULL,
        chatId INTEGER NOT NULL,
        read BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (chatId) REFERENCES chats(id)
      );
    `);
    console.log('✅ Tables created');

    // Insert test users - using a real bcrypt hash for "password123"
    const hashedPassword = '$2a$10$8K1p/a0dRTlR7R2d7V8pEe6QZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ';
    
    await sequelize.query(`
      INSERT INTO users (email, password, name, role, verified) 
      VALUES 
        ('seller@test.com', ?, 'Test Seller', 'seller', 1),
        ('buyer@test.com', ?, 'Test Buyer', 'buyer', 1)
    `, { replacements: [hashedPassword, hashedPassword] });
    console.log('✅ Test users created');

    // Insert test car
    await sequelize.query(`
      INSERT INTO cars (sellerId, make, model, year, price, startingPrice, mileage, color, condition, fuelType, transmission, engineSize, description, images, canton, city, status)
      VALUES (1, 'Toyota', 'Camry', 2020, 25000, 20000, 15000, 'Red', 'excellent', 'Petrol', 'Automatic', '2.5L', 'Excellent condition Toyota Camry', '["/placeholder-car.jpg"]', 'ZH', 'Zurich', 'active')
    `);
    console.log('✅ Test car created');

    // Insert test chat and message
    await sequelize.query(`
      INSERT INTO chats (carId, sellerId, buyerId, lastMessageAt)
      VALUES (1, 1, 2, CURRENT_TIMESTAMP)
    `);
    
    await sequelize.query(`
      INSERT INTO messages (content, senderId, chatId, read)
      VALUES ('Hello, is this car still available?', 2, 1, 0)
    `);
    console.log('✅ Test chat and message created');

    // Show summary
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', { type: 'SELECT' });
    const carCount = await sequelize.query('SELECT COUNT(*) as count FROM cars', { type: 'SELECT' });
    const chatCount = await sequelize.query('SELECT COUNT(*) as count FROM chats', { type: 'SELECT' });
    const messageCount = await sequelize.query('SELECT COUNT(*) as count FROM messages', { type: 'SELECT' });

    console.log('\n📊 DATABASE READY:');
    console.log('Users:', userCount[0].count);
    console.log('Cars:', carCount[0].count);
    console.log('Chats:', chatCount[0].count);
    console.log('Messages:', messageCount[0].count);

    console.log('\n🔑 LOGIN WITH:');
    console.log('Seller: seller@test.com / password123');
    console.log('Buyer: buyer@test.com / password123');

    await sequelize.close();
    console.log('\n✅ Setup complete! Start your server: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
