const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authentication');

// models import
import Template from '../models/template';
import Device from '../models/device.js';

//get templates
router.get('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        const templates = await Template.find({userId: userId});

        console.log(userId);
        console.log(templates)

        const response = {
            status: "success",
            data: templates
        }

        return res.json(response);

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }
});


// create templates
router.post('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        var newTemplate = req.body.template;

        newTemplate.userId = userId;
        newTemplate.createdTime = Date.now();

        //newTemplete.widgets tarea pendiente
        // en widgets viene un array, la tarea es 
        //generar un id para cada elemento aqui en el bkend

        const r = await Template.create(newTemplate);

        const response = {
            status: "success",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }
});

//delete template
router.delete('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;
        const templateId = req.query.templateId;

        // busca si hay disp con esa plantilla
        const devices = await Device.find({userId: userId, templateId: templateId });

        if (devices.length > 0){

            const response = {
                status: "fail",
                error: "template in use"
            }

            return res.json(response);
        }

        const r = await Template.deleteOne({userId: userId, _id: templateId});

        const response = {
            status: "success",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }
});

module.exports = router; 