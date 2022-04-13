const bcrypt = require('bcryptjs')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": String,
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = function() {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://db_user:db_user@devanshiweb322.5kt2y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {

            bcrypt.hash(userData.password, 10, function(err, hash) {
                if (err) {
                    reject("error encrypting password");
                } else {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        } else {
                            resolve();
                        }
                    })
                }
            })

        }
    })
};


module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then(users => {
                bcrypt.compare(userData.password, users[0].password).then(res => {
                    if (res === true) {
                        users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                        User.update({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } }, { multi: false })
                            .exec()
                            .then(() => { resolve(users[0]) })
                            .catch(err => { reject("There was an error verifying the user: " + err) })
                    } else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            })
    })
};
