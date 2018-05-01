// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

// Authenticate input against database
userSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({username: username}).exec(function (err, user) {
        if (err) {
            return callback(err)
        }

        if (!user) {
            let err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                return callback(null, user);
            }
            else {
                return callback();
            }
        })
    });
};

// Hash the user password before saving it to the database
userSchema.pre('save', function (next) {
    let user = this;

    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        user.password = hash;
        next();
    })
});

let User = mongoose.model('user', userSchema);

module.exports = User;