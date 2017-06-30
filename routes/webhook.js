// Sign and verify Watson Work requests and responses

// Feel free to adapt to your particular security and hosting environment

var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const debug = require('debug');
var request = require('request');

var bparser = require('body-parser');

const APP_ID = "639b18ea-dcaa-4da5-bc8a-f1cf2c26acd2";
const APP_SECRET = "foq4haxi8ivi01fgmd91rbbcpmhqthoy";
const WEBHOOK_SECRET = "fgumxes83tnwj9yqx9a5a0dyodmbxbzz";


var jsonParser = bparser.json();

/* Listen on Webhook */
router.post('/',  jsonParser, function(req, res, next) {

    if(req.get('X-OUTBOUND-TOKEN') !== crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')) {
        console.log('Invalid request signature');
        const err = new Error('Invalid request signature');
        err.status = 401;
        throw err;
    }

    if(req.body.type === 'verification') {

        const challenge = JSON.stringify({
            response: req.body.challenge
        });

        res.set('X-OUTBOUND-TOKEN',
            crypto.createHmac('sha256', WEBHOOK_SECRET).update(challenge).digest('hex'));
        res.type('json').send(challenge);
    }

    if(req.body.annotationType == 'message-focus') {
        console.log('message focus');
        console.log(req.body.spaceName);
        console.log(req.body.annotationPayload);
        console.log(JSON.parse(req.body.annotationPayload).payload);

        var reply = JSON.parse(req.body.annotationPayload).payload
        console.log(JSON.parse(reply).text);
        var text = JSON.parse(reply).text;

        request.post(
            'https://api.watsonwork.ibm.com/oauth/token',
            {
                auth: {
                    user: APP_ID,
                    pass: APP_SECRET
                },
                json: true,
                form: {
                    grant_type: 'client_credentials'
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    console.log(body.access_token);
                }
            }
        );

        request.post(
            'https://api.watsonwork.ibm.com//v1/spaces/'+ +'/messages',
            {
                auth: {
                    user: APP_ID,
                    pass: APP_SECRET
                },
                json: true
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    console.log(body.access_token);
                }
            }
        );


    }


    res.send();

});

/* Listen on Webhook */
router.get('/', function(req, res, next) {
    res.send('Get method on webhook');

});




module.exports = router;
