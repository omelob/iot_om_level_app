const express = require('express');
const router = express.Router();


router.get("/testing", (req, res)=>{
    res.send("Hello IoT OM API from devices.js");
});

module.exports = router;