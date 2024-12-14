const express = require('express');
const { signup, login, getPackages, getPackageById, createBooking, addPackage, updatePackage, deletePackage, getBookings, protectedRoute } = require('../controllers');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

//! Routes for the user
router.post('/signup', signup);
router.post('/login', login);

//! Protected Routes
router.use(authenticateToken);

router.get('/protected', protectedRoute);

//! Routes for the packages
router.get('/packages', getPackages);
router.get('/packages/:id', getPackageById);

//! Routes for the bookings
router.post('/bookings', createBooking);

//! Routes for the admin
router.post('/admin/packages', addPackage);
router.put('/admin/packages/:id', updatePackage);
router.delete('/admin/packages/:id', deletePackage);
router.get('/admin/bookings', getBookings);

module.exports = router;
