import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const isAtlas = uri && uri.includes('mongodb+srv');

    if (isAtlas && (error.code === 'ECONNREFUSED' || error.message.includes('querySrv') || error.message.includes('ENOTFOUND'))) {
      console.error('❌ MongoDB Atlas Connection Failed!');
      console.error('   Reason: Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('');
      console.error('   ► Fix: Go to https://cloud.mongodb.com');
      console.error('     → Select your cluster → Network Access → Add IP Address');
      console.error('     → Click "Allow Access From Anywhere" (0.0.0.0/0) → Confirm');
      console.error('');
      console.error('   ► Alternatively, switch to a local MongoDB instance:');
      console.error('     In backend/.env, set: MONGODB_URI=mongodb://127.0.0.1:27017/ai_web_app');
    } else if (!isAtlas && (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED'))) {
      console.error('❌ Local MongoDB Connection Failed!');
      console.error('   Reason: MongoDB is not running on this machine.');
      console.error('');
      console.error('   ► Fix: Start MongoDB locally:');
      console.error('     - Windows: Run "net start MongoDB" or start it from Services');
      console.error('     - Or download from: https://www.mongodb.com/try/download/community');
    } else {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }

    console.warn('⚠️  Backend is running in fallback mode. Database features will not work until MongoDB is connected.');
  }
};

export default connectDB;
