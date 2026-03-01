const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.,
        ref: 'User',
        required: true
    },
    dentist:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }, 
    date: {
        type: Date,
        require: [true, 'Please provide a booking date'],
        validate: {
            validate: function(value) {
                return value >= new Date();
            },
        }
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);