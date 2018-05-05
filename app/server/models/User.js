// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Defines user model schema.
 */
let userSchema = new mongoose.Schema({
    username: {
        type: 'string',
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: 'string',
        required: true
    },
    highScore: {
        type: 'number'
    }
});

/**
 * Hashes the user's password before saving it in the database.
 */
userSchema.pre('save', function (next) {
    let user = this;

    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            next(err);
        }
        else {
            user.password = hash;
            next();
        }
    })
});

/**
 * Authenticates the given username and password.
 *
 * @param username
 * @param password
 * @param callback
 */
userSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({username: new RegExp(username, 'i') }).exec(function (err, user) {
        if (err) {
            console.log(err);
            return callback(new Error('Internal error'))
        }

        if (!user) {
            return callback(new Error('Invalid username or password'));
        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                callback(null, user);
            }
            else {
                callback(new Error('Invalid username or password'));
            }
        })
    });
};

/**
 * Compiles and exports the user model from the given schema.
 *
 * @type {Model}
 */
module.exports = mongoose.model('user', userSchema);