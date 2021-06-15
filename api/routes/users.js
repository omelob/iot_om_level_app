const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// import models
import User from '../models/user';

// POST -> req.body
// GET -> req.query

// Auth Register
router.post("/register", async (req, res) => {
    
    try {

        const password = req.body.password;
        const encriptedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: encriptedPassword
        }

        const user = await User.create(newUser);

        console.log(user);

        const toSend = {
            status: "success"
        }

        res.status(200).json(toSend);

    } catch (error) {
        console.log("ERROR - REGISTER ENDPOINT");
        console.log(error);

        const toSend = {
            status: "error",
            error: error // esto puede generar fuga de informacion
        };

        res.status(500).json(toSend);
    }
    
    
});

// Auth Login
router.post("/login", async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });

    // error en el email
    if (!user) {
        const toSend = {
            status: "error",
            error: "Invalid Credentials"
        };
        return res.status(401).json(toSend);        
    }

    // email y password ok
    if (bcrypt.compareSync(password, user.password)) {
        
        // se elimina el campo psw del user
        user.set('password', undefined, { strict: false });

        // se genera el token
        const token = jwt.sign({ userData: user }, 'claveDelToken', {expiresIn: 60*60*24*30});

        const toSend = {
            status: "success",
            token: token,
            userData: user
        }
        return res.json(toSend);

    } else {
        const toSend = {
            status: "error",
            error: "Invalid Credentials"
        };
        return res.status(401).json(toSend);
    }

    res.json({ "status": "success" });
});


module.exports = router;