const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availableDates: [{ type: Date, required: true }],
  image: { type: String, required: true },
});

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  travelers: { type: Number, required: true },
  specialRequests: { type: String },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  totalPrice: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], required: true },
});

const Package = mongoose.model('Package', PackageSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {
  Package,
  Booking,
  User,
};
