const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availableDates: [{ type: Date, required: true }],
  image: { type: String, required: true },
});

const BookingSchema = new mongoose.Schema({
  passenger: [{
    name: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true }
  }],
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  travelers: { type: Number, required: true },
  specialRequests: { type: String },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  totalPrice: { type: Number, required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date,required: true },
});

const UserSchema = new mongoose.Schema({
  userName : { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const Package = mongoose.model('Package', PackageSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {
  Package,
  Booking,
  User,
};
