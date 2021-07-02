const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authentication');
const axios = require("axios");

import Device from '../models/device';
import SaverRule from '../models/emqx_saver_rule.js';
import Template from '../models/template';
import AlarmRule from '../models/emqx_alarm_rule.js';
import EmqxAuthRule from "../models/emqx_auth.js";

/* 
  ___  ______ _____ 
 / _ \ | ___ \_   _|
/ /_\ \| |_/ / | |  
|  _  ||  __/  | |  
| | | || |    _| |_ 
\_| |_/\_|    \___/ 
*/

// autenticacion con emqx
const auth = {
    auth: {
        username: "admin",
        password: "emqxsecret"
    }
};

// Llamar todos los dispositivos o uno solo (con el ?id) por el endpoint:
// localhost:3001/api/device o (device?dId=dkajdkaj)
router.get("/device", checkAuth, async (req, res) => {
    
    try {
        const userId = req.userData._id;

        //get devices
        var devices = await Device.find({ userId: userId });
        //mongoose array to js array
        devices = JSON.parse(JSON.stringify(devices));

        //get saver rules de un usuario en particular
        const saverRules = await getSaverRules(userId);

        // get templates
        const templates = await getTemplates(userId);

        //get alarm rules
        const alarmRules = await getAlarmRules(userId);
        
        // se le agrega a cada device la saverRule correspondiente
        devices.forEach((device, index) => {
            devices[index].saverRule = saverRules.filter(saverRule => saverRule.dId == device.dId)[0];
            devices[index].template = templates.filter(template => template._id == device.templateId)[0];
            devices[index].alarmRules = alarmRules.filter(alarmRule => alarmRule.dId == device.dId);
        });

        const response = {
            status: "success",
            data: devices 
        };

        res.json(response);

    } catch (error) {
        
        console.log("ERROR GETTING DEVICES");
        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);
    }    
});

// New device Agregar un dispositivo
router.post("/device", checkAuth, async(req, res) => {

    try {
        const userId = req.userData._id;
        var newDevice = req.body.newDevice;

        newDevice.userId = userId;
        newDevice.createdTime = Date.now();

        newDevice.password = makeid(10);
        
        // se crea la regla asociada al dispositivo
        await createSaverRule(userId, newDevice.dId, true);
        
        // se crea el dispositivo
        const device = await Device.create(newDevice);

        // deja seleccionado el dispositivo que se estaa agregado
        await selectDevice(userId, newDevice.dId);

        const response = {
            status: "success"
        }

        return res.json(response);

    } catch (error) {
        
        console.log("ERROR CREATING NEW DEVICE");
        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);
    }
});

// Borrar un dispositivo
router.delete("/device", checkAuth, async(req, res) => {
    
    try {

        const userId = req.userData._id;
        const dId = req.query.dId;

        // borra la regla en emqx y en mongo
        await deleteSaverRule(dId);

        //deleting all posible alarm rules
        await deleteAllAlarmRules(userId, dId);

        //deleting all posible mqtt device credentials
        await deleteMqttDeviceCredentials(dId);

        //deleting device
        const result = await Device.deleteOne({ userId: userId, dId: dId });

        //devices after deletion
        const devices = await Device.find({ userId: userId });

        if (devices.length >= 1) {
            //any selected?
            var found = false;
            devices.forEach(devices => {
                if (devices.selected == true) {
                found = true;
                }
            });

            //if no selected...
            //we need to selet the first
            if (!found) {
                await Device.updateMany({ userId: userId }, { selected: false });
                await Device.updateOne(
                    { userId: userId, dId: devices[0].dId },
                    { selected: true }
                );
            }
        }

        const response = {
            status: "success",
            data: result
        }

        return res.json(response)

    } catch (error) {

        console.log("ERROR DELETING A DEVICE");
        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);
    } 
});

// Modificar un dispositivo (opcion selector)
router.put("/device", checkAuth, async (req, res) => {
    
    try {
        const dId = req.body.dId;
        const userId = req.userData._id;

        if (await selectDevice(userId, dId)) {
            const response = {
                status: "success"
            };

            return res.json(response);

        } else {
            const response = {
                status: "error"
            };

            return res.json(response);
        }
    } catch (error) {
        console.log(error);
    }        
});

//SAVER-RULE STATUS UPDATER
router.put('/saver-rule', checkAuth, async (req, res) => {

    try {
        const rule = req.body.rule;

        console.log(rule)

        await updateSaverRuleStatus(rule.emqxRuleId, rule.status)

        const response = {
            status: "success"
        };

        res.json(response);

    } catch (error) {
        console.log(error);
    }  
});

/* 
______ _   _ _   _ _____ _____ _____ _____ _   _  _____ 
|  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |/  ___|
| |_  | | | |  \| | /  \/ | |   | | | | | |  \| |\ `--. 
|  _| | | | | . ` | |     | |   | | | | | | . ` | `--. \
| |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |/\__/ /
\_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/\____/  
*/

async function getAlarmRules(userId) {

    try {
        const rules = await AlarmRule.find({ userId: userId });
        return rules;
    } catch (error) {
        return "error";
    }
}


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

/**
 * SAVER RULES FUNCTIONS
 */

// get templates
async function getTemplates(userId) {
    
    try {
        const templates = await Template.find({ userId: userId });
        return templates;
    } catch (error) {
        return false;
    }
}

// get saver rules descarga de mongo las reglas del usuario
async function getSaverRules(userId) {
    
    try {
        const rules = await SaverRule.find({ userId: userId });
        return rules;
    } catch (error) {
        return false;
    }
}

// create saver rule
async function createSaverRule(userId, dId, status) {
    
    try {
        const url = "http://localhost:8085/api/v4/rules";

        const topic = userId + "/" + dId + "/+/sdata";

        const rawsql = "SELECT topic, payload FROM \"" + topic + "\" WHERE payload.save = 1";

        var newRule = {
            rawsql: rawsql,
            actions: [
                {
                    name: "data_to_webserver",
                    params: {
                        $resource: global.saverResource.id,
                        payload_tmpl: '{"userId":"' +  userId + '","payload":${payload},"topic":"${topic}"}'
                    }
                }
            ],
            description: "SAVER-RULE",
            enabled: status
        };

        //save rule in emqx - grabamos la regla en emqx
        const res = await axios.post(url, newRule, auth);
                
        if (res.status === 200 && res.data.data) {
            
            await SaverRule.create({
                userId: userId,
                dId: dId,
                emqxRuleId: res.data.data.id,
                status: status
            });

            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error creating saver rule")
        console.log(error);
        return false;
    }    
}

// update saver rule
async function updateSaverRuleStatus(emqxRuleId, status) {
    
    try {
        const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;

        const newRule = {
            enabled: status
        }

        const res = await axios.put(url, newRule, auth);

        if (res.status === 200 && res.data.data) {
            await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status })
            console.log("Saver Rule Status Updated...".green);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// delete saver rule
async function deleteSaverRule(dId) {
    try {
        // trae de mongo los datos de la regla a borrar
        const mongoRule = await SaverRule.findOne({ dId: dId });
        // se arma el endpoint
        const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;
        // se borra la regla en emqx
        const emqxRule = await axios.delete(url, auth);
        // se borra la regla en mongo
        const deleted = await SaverRule.deleteOne({ dId: dId });

        return true;

    } catch (error) {
        console.log("Error deleting saver rule");
        console.log(error);
        return false;
    }
}

//delete ALL alarm Rules...
async function deleteAllAlarmRules(userId, dId) {
  try {
    const rules = await AlarmRule.find({ userId: userId, dId: dId });

    if (rules.length > 0) {
      asyncForEach(rules, async rule => {
        const url = "http://localhost:8085/api/v4/rules/" + rule.emqxRuleId;
        const res = await axios.delete(url, auth);
      });

      await AlarmRule.deleteMany({ userId: userId, dId: dId });
    }

    return true;
  } catch (error) {
    console.log(error);
    return "error";
  }
}

// We can solve this by creating our own asyncForEach() method:
// thanks to Sebastien Chopin - Nuxt Creator :)
// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

//delete ALL emqx device  auth rules
async function deleteMqttDeviceCredentials(dId) {
  try {
    await EmqxAuthRule.deleteMany({ dId: dId, type: "device" });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// crea passwords aleatorios
function makeid(length) {

    try {
        var result = "";
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    } catch (error) {
        console.log(error);
    }    
}

module.exports = router;