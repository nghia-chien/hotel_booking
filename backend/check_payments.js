import mongoose from 'mongoose';
import Payment from './src/models/Payment.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking';

async function checkPayments() {
  await mongoose.connect(MONGO_URI);
  const payments = await Payment.find().populate('customer', 'email');
  console.log(JSON.stringify(payments, null, 2));
  await mongoose.disconnect();
}

checkPayments();
