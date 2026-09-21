import mongoose from 'mongoose';
import 'dotenv/config';

const migrateAvailabilityIndex = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('availabilities');

    // Drop the old index
    console.log('🗑️  Dropping old index: userId_1_dayofweek_1');
    try {
      await collection.dropIndex('userId_1_dayofweek_1');
      console.log('✅ Old index dropped successfully');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index does not exist, skipping...');
      } else {
        throw err;
      }
    }

    // Create new index
    console.log('📝 Creating new index: userId_1_dayOfWeek_1');
    await collection.createIndex(
      { userId: 1, dayOfWeek: 1 },
      { unique: true, name: 'userId_1_dayOfWeek_1' }
    );
    console.log('✅ New index created successfully');

    // Optional: Update existing documents to rename the field
    console.log('🔄 Renaming field dayofweek to dayOfWeek in all documents...');
    const result = await collection.updateMany(
      { dayofweek: { $exists: true } },
      { $rename: { dayofweek: 'dayOfWeek' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} document(s)`);

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateAvailabilityIndex();
