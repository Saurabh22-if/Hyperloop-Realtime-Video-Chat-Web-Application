const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/userData");


// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    username: {
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true 
    }
});
// Collection for registered users
const collection = mongoose.model("registeredUsers", Loginschema);

module.exports = {
    collection
};

