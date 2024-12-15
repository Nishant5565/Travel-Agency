const { Package, Booking, User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

//* function to generate the token
const generateToken = (user, remember) => {
  return jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: remember ? '365d' : '1d' });
};

const signup = async (req, res) => {
  try {
    const {userName, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userName, email, password: hashedPassword, role });
    await newUser.save();
    const token = generateToken(newUser, false);    
    res.status(201).json({ message: `Hello ${userName}, Thanks for registering in Vista ` , token, user : newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user', error });

  }
};

const login = async (req, res) => {
  try {
    const { email, password , remember , role} = req.body;
    console.log(remember);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== role) return res.status(401).json({ message: 'No acccount with this email registered as ' + role });

    const token = generateToken(user, remember);
    res.status(200).json({ message: `Hello ${user.userName}, Welcome back to Vista`, token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};


// Get all packages
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) return res.status(404).json({ message: 'Package not found' });
    res.json(package);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package', error });
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { passenger, email, phoneNumber, travelers, specialRequests, packageId, selectedDate } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const packageData = await Package.findById(packageId);
    if (!packageData) return res.status(404).json({ message: 'Package not found' });

    if (!Array.isArray(passenger) || passenger.length !== travelers || travelers <= 0) {
      return res.status(400).json({ message: 'Number of travelers must be a positive value and match the number of passengers provided' });
    }

    if (isNaN(Date.parse(selectedDate))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const totalPrice = travelers * packageData.price;
    const booking = new Booking({
      passenger,
      email,
      phoneNumber,
      travelers,
      specialRequests,
      package: packageId,
      totalPrice,
      bookedBy: user.id,
      date: new Date(selectedDate)
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
};
// Add a new package
const addPackage = async (req, res) => {
  console.log(req.body);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'Employer') return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, price, availableDates, image } = req.body;
    const newPackage = new Package({ title, description, price, availableDates, image });
    await newPackage.save();
    res.status(200).json({ message: 'Package created successfully', newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating package', error });
  }
};

// Update a package
const updatePackage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'Employer') return res.status(401).json({ message: 'Unauthorized' });
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPackage) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json({ message: 'Package updated successfully', updatedPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating package', error });
  }
};

// Delete a package
const deletePackage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'Employer') return res.status(401).json({ message: 'Unauthorized' });
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPackage) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package', error });
  }
};

// View all bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('package');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Get booking analytics
const getBookingAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking analytics', error });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

    const userId = decoded.id;
    const bookings = await Booking.find({ bookedBy: userId }).populate('package');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user bookings', error });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

    const userId = decoded.id;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.bookedBy.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

module.exports = {
  signup,
  login,
  getPackages,
  getPackageById,
  createBooking,
  addPackage,
  updatePackage,
  deletePackage,
  getBookings,
  getBookingAnalytics,
  getUserBookings,
  cancelBooking, 
};


