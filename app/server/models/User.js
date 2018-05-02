// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Defines user model schema.
 */
let userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

/**
 * Authenticates the given username and password.
 *
 * @param username
 * @param password
 * @param callback
 */
userSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({username: username}).exec(function (err, user) {
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

/**
 * Hashes the user's password before saving it in the database.
 */
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

/**
 * Compiles and exports the user model from the given schema.
 *
 * @type {Model}
 */
module.exports = mongoose.model('user', userSchema);