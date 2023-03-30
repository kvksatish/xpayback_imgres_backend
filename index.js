const express = require("express")
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connection } = require("./Config/db.js")
const { UserModel } = require("./Models/User")
const passwordValidator = require('password-validator');
const validator = require('validator');
const cors = require('cors');
const authentication = require("./Middleware/authentication.js");
const { default: axios } = require("axios");

const app = express()

require("dotenv").config()
app.use(express.json())
app.use(cors());

app.get("/", (req, res) => {
    res.send("welcome")
})

app.post("/login", async (req, res) => {

    //  res.send("wrgnrggnrgngnnnnnyrn")
    let { email, password } = req.body
    let user = await UserModel.findOne({ email })

    console.log(user)
    let hash = user.password
    bcrypt.compare(password, hash, function (err, result) {

        if (result) {
            var token = jwt.sign({ email: email }, 'secret');
            console.log(token)
            res.send({ "msg": "Login success", "token": token })

        }

        else {
            res.send("Login Failed")
        }

    })
})

const passwordSchema = new passwordValidator();

// Define the password criteria
passwordSchema
    .is().min(8) // Minimum length of 8 characters
    .has().uppercase() // Must have at least one uppercase letter
    .has().lowercase() // Must have at least one lowercase letter
    .has().digits() // Must have at least one digit
    .has().symbols() // Must have at least one symbol
    .has().not().spaces(); // Must not contain spaces

app.post("/signup", async (req, res) => {
    console.log(req.body)
    let { username, email, password } = req.body

    // Validate the email
    if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email address");
    }

    // Validate the password
    if (!passwordSchema.validate(password)) {
        return res.status(400).send("Invalid password. Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one digit, one symbol, and no spaces.");
    }

    try {
        // Hash the password
        const hash = await bcrypt.hash(password, 6);

        // Create a new user with the hashed password
        const user = new UserModel({ username, email, password: hash });

        // Save the user to the database
        await user.save();

        res.send("Signup Successful");
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong or invalid or used credentials. Please try again later.");
    }
});



app.get("/dashboard", authentication, async (req, res) => {
    // console.log(req.query)
    try {
        // Hash the password
        const searcher = req.query;
        console.log(searcher.type, "sdhjdghjn")
        let response = await axios.get(`https://api.spacexdata.com/v3/capsules?type=${searcher.type}&original_launch=${searcher.original_launch}&status=${searcher.status}`)
        console.log(response)
        res.send(response.data);
    } catch (err) {///
        ////
        res.status(500).send("Error retrieving data from API.");
    }////


});


app.listen(7500, async () => {
    try {
        await connection
        console.log("connected")
    }
    catch (err) {
        console.log("not connected")
        console.log(err)
    }
    console.log("linstening to port 7500")
    // console.log(process.env.NAME)
    //console.log(process.env.MONGO_URL)
})