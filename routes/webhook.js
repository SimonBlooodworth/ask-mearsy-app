// Sign and verify Watson Work requests and responses

// Feel free to adapt to your particular security and hosting environment

var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const debug = require('debug');
var request = require('request');
var rp = require('request-promise')

var fs = require('fs');
var storage = require('node-persist');

var bparser = require('body-parser');

// MEARSEY
/*const APP_ID = "639b18ea-dcaa-4da5-bc8a-f1cf2c26acd2";
const APP_SECRET = "foq4haxi8ivi01fgmd91rbbcpmhqthoy";
const WEBHOOK_SECRET = "3qfyjv8y6rx2jsvq25v9uk0ur8n9n004";*/

// MEARSEY_LOCAL
const APP_ID = "d42821da-2fd2-4c16-819d-697d3cdca584";
const APP_SECRET = "25ao5tls9xmfkqyy5u1wd69fanla46u";
const WEBHOOK_SECRET = "nskzo08ekj5naz1hjau30qyolipgcw3t";


var jsonParser = bparser.json();

/* Listen on Webhook */
router.post('/',  jsonParser, function(req, res, next) {

    if (req.body.type === 'verification') {

        const challenge = JSON.stringify({
            response: req.body.challenge
        });

        res.set('X-OUTBOUND-TOKEN',
            crypto.createHmac('sha256', WEBHOOK_SECRET).update(challenge).digest('hex'));
        res.type('json').send(challenge);


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
                    storage.setItem('token', response.body.access_token);

                    var formData = {

                        file: fs.createReadStream(__dirname + '/mearsy.jpg'),

                    };

                    request.post(
                        'https://api.watsonwork.ibm.com/photos/',
                        {
                            headers: {
                                'Authorization': 'Bearer ' + storage.getItemSync('token'),

                            },
                            formData: formData,
                            json: true
                        },
                        function (error, response, body) {

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

    if (req.get('X-OUTBOUND-TOKEN') !== crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')) {
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
                    storage.setItem('token', response.body.access_token);
                }


            }
        );

    }

    if (req.body.annotationType == 'actionSelected') {

        console.log(JSON.parse(req.body.annotationPayload).targetDialogId );
        var createTargetedMessage = "mutation {createTargetedMessage(input: {conversationId: \"" + req.body.spaceId + "\", targetDialogId: \"" + JSON.parse(req.body.annotationPayload).targetDialogId + "\", targetUserId: \"" + req.body.userId + "\", annotations: [{genericAnnotation: {text: \"text\"}}], " +
            "attachments: [{type: CARD, cardInput: {type: INFORMATION, informationCardInput: {title: \"Useful Tool\", text: \"text\", subtitle: \"subtitle\", date: \"1499158974426\", buttons: [{text: \"text\", payload: \"payload\", style: PRIMARY}] }}}" +
            ",{type: CARD, cardInput: {type: INFORMATION, informationCardInput: {title: \"informationcardtitle\", text: \"text\", subtitle: \"subtitle\", date: \"1499158974426\", buttons: [{text: \"text\", payload: \"payload\", style: PRIMARY}] }}}" +
            "]}) {successful}}"


        //if (JSON.parse(req.body.annotationPayload).actions.contains("All About Beards!")) {
            var title = "Mearsey knows beards!";
            var text = "So you want to know about beards. Well you have hit the jackpot.";
        //} else {*/
           // var title = "It's me, Mearsey !";
           // var text = "I am here to help you to answers your questions and provide you with the information you need to do work at Mears.";

        //var createTargetedMessage = "mutation {createTargetedMessage(input: {conversationId: \"" + req.body.spaceId + "\", targetDialogId: \"" + JSON.parse(req.body.annotationPayload).targetDialogId + "\", targetUserId: \"" + req.body.userId + "\", annotations: [{genericAnnotation: {title: \"" + title + "\" , text: \"" + text + "\"}}  ]  }) {successful}} "

        console.log(createTargetedMessage);
        request.post(
            'https://api.watsonwork.ibm.com/graphql',
            {
                headers: {
                    'Authorization': 'Bearer ' + storage.getItem('token'),
                    'Content-Type': 'application/graphql',
                    'x-graphql-view': 'PUBLIC, BETA'
                },
                body:createTargetedMessage
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

    if(req.body.annotationType == 'message-focus') {
        console.log('message focus');
        console.log(req.body.spaceId);
        console.log(JSON.parse(req.body.annotationPayload).payload);

        var reply = JSON.parse(req.body.annotationPayload).payload
        console.log(JSON.parse(reply).text);
        var text = JSON.parse(reply).text;
        var spaceId = req.body.spaceId;



        request.post(
            'https://api.watsonwork.ibm.com/v1/spaces/'+spaceId+'/messages',
            {
                headers: {
                    'Authorization': 'Bearer ' + storage.getItem('token'),
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
                            "title": "",
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
                    console.log("HERE");

                } else {
                    console.log(error);
                    console.log("Andrew");
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
