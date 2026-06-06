import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: '../.env' });

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Change this email to the email you registered with
    const emailToPromote = 'mdzeeshan08886@gmail.com'; 

    const user = await User.findOne({ email: emailToPromote });

    if (!user) {
      console.log(`User with email ${emailToPromote} not found.`);
      process.exit(1);
    }

    user.role = 'superadmin';
    await user.save();

    console.log(`Success! ${user.name} (${user.email}) is now a SUPERADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

promoteUser();
