import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing roles & seed
    await Role.deleteMany();
    const adminRole = await Role.create({
      name: 'Admin',
      description: 'Full administrative access and system oversight',
      permissions: ['all']
    });
    const userRole = await Role.create({
      name: 'User',
      description: 'Standard access for interacting with AI models and files',
      permissions: ['read', 'write']
    });
    console.log('Roles seeded: Admin, User.');

    // Seed default settings
    await Setting.deleteMany();
    await Setting.create([
      { key: 'max_upload_size_mb', value: 10, description: 'Maximum file upload size in megabytes' },
      { key: 'default_ai_model', value: 'gpt-4o-mini', description: 'Primary chat model for general conversations' },
      { key: 'system_instructions', value: 'You are a helpful, professional, and friendly AI assistant.', description: 'Base instruction injected into chat history' }
    ]);
    console.log('Default system settings seeded.');

    // Clear existing users and seed
    await User.deleteMany();
    
    // Seed Admin user
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: adminRole._id,
      subscription: {
        plan: 'Enterprise',
        active: true
      }
    });

    // Seed Regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'UserPass123!',
      role: userRole._id,
      subscription: {
        plan: 'Free',
        active: true
      }
    });

    console.log('Users seeded:');
    console.log(`- Admin: admin@example.com / AdminPass123!`);
    console.log(`- User: user@example.com / UserPass123!`);
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
