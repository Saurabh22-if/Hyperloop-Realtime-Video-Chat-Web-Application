const express = require("express");
const { collection } = require('./config');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const { v4: uuidv4 } = require('uuid');

app.use(session({
    secret: "9eyb2kxn1z@",
    resave: false,
    saveUninitialized: false,
}));

dotenv.config();

app.use(bodyparser.json());

// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

//use EJS as the view engine
app.set("view engine", "ejs");


// Define authentication middleware
function authenticateUser(req, res, next) {
    if (req.session.user) {
        console.log('User is authenticated:', req.session.user);
        next();
    } else {
        console.log('User is not authenticated');
        res.redirect("/login");
    }
}

function generateUserId() {
    return uuidv4();
}

app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.render("index");
    }
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/login");
    });
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.get("/dashboard", authenticateUser, async (req, res) => {
    const { username, email } = req.session.user;
    console.log("Authenticated Username:", username);
    console.log("Authenticated Email:", email);
    if (req.session.user) {
        const { username, email, userId } = req.session.user;
        res.render("dashboard", { user: { username, email, userId } });
    } else {
        res.redirect("/login");
    }
});

// Profile update route
app.post("/update-profile", authenticateUser, async (req, res) => {
    try {
        const newUsername = req.body.newUsername;
        const newEmail = req.body.newEmail;

        // Get the user's email from the session
        const userEmail = req.session.user.email;

        // Check if the user wants to update the password
        let newPassword = req.body.newPassword;
        if (newPassword === "") {
            // If newPassword is empty, the user doesn't want to update the password
            newPassword = null;
        } else {
            // Hash the new password
            const saltrounds = 10;
            newPassword = await bcrypt.hash(newPassword, saltrounds);
        }

        // Update the user's information in the database
        const result = await collection.updateOne(
            { email: userEmail },
            {
                $set: {
                    username: newUsername,
                    email: newEmail,
                    password: newPassword, // This updates the hashed password
                },
            }
        );

        if (result.modifiedCount === 1) {
            // Update successful
            req.session.user.username = newUsername; // Update the username in the session
            req.session.user.email = newEmail; // Update the email in the session
            res.json({ success: true, message: "Profile updated successfully!" });
        } else {
            res.json({ success: false, message: "Profile update failed." });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.json({ success: false, message: "An error occurred while updating the profile." });
    }
});

app.get('/lobby', authenticateUser, (req, res) => {
    const user = req.session.user; 
    res.render('lobby', { user }); 
 });


 app.get('/room/:roomId', authenticateUser,async (req, res) => {
    // Get the roomId from the URL
    const roomId = req.params.roomId;
    res.render('room', { roomId});
        
});

app.get("/check-login", (req, res) => {
    // Check if the user is authenticated
    if (req.session.user) {
        // User is authenticated, send JSON response
        res.json({ userIsLoggedIn: true });
        console.log("User is authenticated:", req.session.user);
    } else {
        // User is not authenticated, send JSON response
        res.json({ userIsLoggedIn: false });
    }
});
 
app.post("/register", 
    async (req, res) => 
    {
    // Registration logic
    const userId = uuidv4();
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        userId, // Include userId in the user data
    };

    // Generate a random 4-digit number
    const randomId = Math.floor(1000 + Math.random() * 9000);

     // Combine the random ID with the "#" symbol
     data.userId = `#${randomId}`;

    //checking if user already exists in database
    const existingUser = await collection.findOne({username: data.username});
    
    if (existingUser) {
        res.json({ isValid: false, message: "* Username is already taken. *" });
    }
    else{

        res.json({ isValid: true });
        // hash the password 
        const saltrounds = 10;
        const hasedPassword = await bcrypt.hash(data.password, saltrounds);

        data.password = hasedPassword; // replace hash password with og pass

        const userdata = await collection.insertMany(data);
        console.log(userdata);

         // Send a success response
        res.json({ isValid: true, message: "Registration successful!", userId: data.userId });
    }
});

//login 
app.post("/login", async (req, res) => {
    // Authentication
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            console.log("Invalid Email or Password.");
            res.json({ isValid: false, message: "Invalid Email or Password." });
        } else {
            // Compare the hashed password from the database with the plaintext password
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (isPasswordMatch) {
                // Set the user session here
                req.session.user = {
                    userId: check.userId,
                    username: check.username, // Use the actual property where you store the username in the database
                    email: req.body.email, // Store the email for reference
                };
                console.log('User ID,User email and username set in session:', req.session.user); 
                res.json({ isValid: true, message: "Login Successful!" }); // Send the response here
            } else {
                // Send the response here
                res.json({ isValid: false, message: "Invalid Email or Password." });
            }
        }
    } catch (err) {
        console.error("Error occurred:", err);
        // Send the response here
        res.json({ isValid: false, message: "Error occurred." });
    }
});


// Logout route




const port = 5000;
app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`)
});

