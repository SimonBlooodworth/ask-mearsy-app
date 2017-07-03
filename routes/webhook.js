// Sign and verify Watson Work requests and responses

// Feel free to adapt to your particular security and hosting environment

var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const debug = require('debug');
var request = require('request');
var rp = require('request-promise')

var bparser = require('body-parser');

const APP_ID = "639b18ea-dcaa-4da5-bc8a-f1cf2c26acd2";
const APP_SECRET = "foq4haxi8ivi01fgmd91rbbcpmhqthoy";
const WEBHOOK_SECRET = "3qfyjv8y6rx2jsvq25v9uk0ur8n9n004";

var jsonParser = bparser.json();

/* Listen on Webhook */
router.post('/',  jsonParser, function(req, res, next) {

    if(req.body.type === 'verification' && check==false) {

        const challenge = JSON.stringify({
            response: req.body.challenge
        });

        res.set('X-OUTBOUND-TOKEN',
            crypto.createHmac('sha256', WEBHOOK_SECRET).update(challenge).digest('hex'));
        res.type('json').send(challenge);
    }

    if(req.get('X-OUTBOUND-TOKEN') !== crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')) {
        console.log('Invalid request signature');
        const err = new Error('Invalid request signature');
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
                    console.log(body);
                    console.log(body.access_token);
                }


            }
        );

    }

    if(req.body.annotationType == 'message-focus') {
        console.log('message focus');
        console.log(req.body.spaceId);
        console.log(JSON.parse(req.body.annotationPayload).payload);

        var reply = JSON.parse(req.body.annotationPayload).payload
        console.log(JSON.parse(reply).text);
        var text = JSON.parse(reply).text;
        var spaceId = req.body.spaceId;


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
                    console.log(response.body);
                    console.log(response.body.access_token);

                    request.post(
                        'https://api.watsonwork.ibm.com/v1/spaces/'+spaceId+'/messages',
                        {
                            headers: {
                                'Authorization': 'Bearer ' + response.body.access_token,
                                'spaceid':spaceId

                            },
                            body:{
                                "type": "appMessage",
                                "version": "1",

                                "annotations":  [
                                    {

                                        "type": "generic",
                                        "version": "1",

                                        "color": "#36a64f",
                                        "title": "Mearsey says:",
                                        "text": text[0],

                                    }
                                ]
                            },
                            json: true
                        },
                        function (error, response, body) {
                            console.log(response.statusCode);
                            if (!error && response.statusCode == 200) {
                                console.log(response.body);

                            } else {
                                console.log(error);
                            }
                        }
                    );

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
