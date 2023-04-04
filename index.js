const express = require("express")
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connection } = require("./Config/db.js")
const { UserModel } = require("./Models/User")
const passwordValidator = require('password-validator');
const validator = require('validator');
const cors = require('cors');
const authentication = require("./Middleware/authentication.js");
const cloudinary = require("./cloudinary.js");
const { default: axios } = require("axios");

const app = express()


require("dotenv").config()
app.use(express.json())
app.use(cors());

const multer = require('multer');
const { ImagesModel } = require("./Models/ImagesData.js");
const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

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



app.post("/dashboard", authentication, async (req, res) => {
    const { image, email } = req.body
    // console.log(email)
    try {
        console.log("1")
        const result1 = await cloudinary.uploader.upload(image, {
            folder: "resimgs"
        })
        console.log("2")
        const result2 = await cloudinary.uploader.upload(image, {
            folder: "resimgs",
            width: 100,
            crop: "scale"
        })
        console.log("3")
        const result3 = await cloudinary.uploader.upload(image, {
            folder: "resimgs",
            width: 300,
            crop: "scale"
        })
        const imglinks = new ImagesModel({ email, imgslinks: [result2, result3, result1] });

        // Save the user to the database
        await imglinks.save();
        console.log(result1, result2, result3, "4")
        res.send({ result1, result2, result3 });


    } catch (err) {
        console.error(err, "error");
        res.status(500).send("Error uploading file");
    }
});

app.get("/getallimgs", authentication, async (req, res) => {
    const { email } = req.body
    // console.log(email)
    try {
        let imglinks = await ImagesModel.find({ email })
        res.send(imglinks);


    } catch (err) {
        console.error(err, "error");
        res.status(500).send("Error uploading file");
    }
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