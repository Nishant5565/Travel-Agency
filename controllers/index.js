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
    const { email, password , remember} = req.body;
    console.log(remember);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user, remember);
    res.status(200).json({ message: `Hello ${user.userName}, Welcome back to Vista`, token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Protected Route Example
const protectedRoute = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ message: 'Protected data', decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
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
    const { name, email, phoneNumber, travelers, specialRequests, packageId } = req.body;
    const packageData = await Package.findById(packageId);

    if (!packageData) return res.status(404).json({ message: 'Package not found' });

    if (travelers <= 0) {
      return res.status(400).json({ message: 'Number of travelers must be a positive value' });
    }

    const totalPrice = travelers * packageData.price;
    const booking = new Booking({
      name,
      email,
      phoneNumber,
      travelers,
      specialRequests,
      package: packageId,
      totalPrice,
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

// Add a new package
const addPackage = async (req, res) => {
  try {
    const { title, description, price, availableDates, image } = req.body;
    const newPackage = new Package({ title, description, price, availableDates, image });
    await newPackage.save();
    res.status(201).json({ message: 'Package created successfully', newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating package', error });
  }
};

// Update a package
const updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPackage) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package updated successfully', updatedPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating package', error });
  }
};

// Delete a package
const deletePackage = async (req, res) => {
  try {
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

module.exports = {
  signup,
  login,
  protectedRoute,
  getPackages,
  getPackageById,
  createBooking,
  addPackage,
  updatePackage,
  deletePackage,
  getBookings,
};
