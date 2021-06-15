const express = require('express');
const router = express.Router();

const { checkAuth } = require('../middlewares/authentication');

import { async } from 'q';
/**
 *    _____             .___     .__          
  /     \   ____   __| _/____ |  |   ______
 /  \ /  \ /  _ \ / __ |/ __ \|  |  /  ___/
/    Y    (  <_> ) /_/ \  ___/|  |__\___ \ 
\____|__  /\____/\____ |\___  >____/____  >
        \/            \/    \/          \/ 
 */
import Device from '../models/device';

/**   _____ __________.___ 
  /  _  \\______   \   |
 /  /_\  \|     ___/   |
/    |    \    |   |   |
\____|__  /____|   |___|
        \/               */

/* 
{
    "newDevice":{
        "dId":"121212",
        "name":"HOME",
        "templateName":"esp32 template",
        "templateId":"ababab"
    }
}
*/

// Llamar todos los dispositivos o uno solo (con el ?id) por el endpoint:
// localhost:3001/api/device o (device?dId=dkajdkaj)
router.get("/device", checkAuth, async (req, res) => {
    
    try {
        const userId = req.userData._id;

        const devices = await Device.find({ userId: userId });

        const toSend = {
            status: "success",
            data: devices
        };

    } catch (error) {
        
        console.log("ERROR GETTING DEVICES");

        const toSend = {
            status: "error",
            error: error
        }

        return res.status(500).json(toSend);
    }
    
});

// Agregar un dispositivo
router.post("/device", checkAuth, async(req, res) => {

    try {

        const userId = req.userData._id;
        var newDevice = req.body.newDevice;

        newDevice.userId = userId;
        newDevice.createdTime = Date.now();

        const device = await Device.create(newDevice);

        selectDevice(userId, newDevice.dId);

        const toSend = {
            status: "success"
        }

        return res.json(toSend)

    } catch (error) {
        
        console.log("ERROR CREATING NEW DEVICE");
        console.log(error);

        const toSend = {
            status: "error",
            error: error
        }

        return res.status(500).json(toSend);
    }    
    
});

// Borrar un dispositivo
router.delete("/device", checkAuth, async(req, res) => {
    
    try {

        const userId = req.userData._id;
        const dId = req.query.dId;

        const result = await Device.deleteOne({ userId: userId, dId: dId });

        const toSend = {
            status: "success",
            data: result
        }

        return res.json(toSend)

    } catch (error) {

        console.log("ERROR DELETING A DEVICE");
        console.log(error);

        const toSend = {
            status: "error",
            error: error
        }

        return res.status(500).json(toSend);
    }
    

});

// Modificar un dispositivo
router.put("/device", checkAuth, (req, res) => {
    const dId = req.body.dId;
    const userId = req.userData._id;

    if (selectDevice(userId, dId)) {
        const toSend = {
            status: "success"
        }
        return res.json(toSend);
    } else {
        const toSend = {
            status: "error"
        }
        return res.json(toSend);
    }
    
});

/**___________                  .__                             
\_   _____/_ __  ____   ____ |__| ____   ____   ____   ______
 |    __)|  |  \/    \_/ ___\|  |/  _ \ /    \_/ __ \ /  ___/
 |     \ |  |  /   |  \  \___|  (  <_> )   |  \  ___/ \___ \ 
 \___  / |____/|___|  /\___  >__|\____/|___|  /\___  >____  >
     \/             \/     \/               \/     \/     \/  */


async function selectDevice(userId, dId) {
    
    try {
        const result = await Device.updateMany({ userId: userId }, { selected: false });
        const result2 = await Device.updateOne({ dId: dId, userId: userId },{selected: true});

        return true;

    } catch (error) {
        
        console.log("ERROR IN 'selectDevice' FUNCTION");
        console.log(error);
        return false;

    }
    
}


module.exports = router;