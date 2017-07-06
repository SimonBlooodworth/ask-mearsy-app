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

    if (req.body.type == 'message-created') {

        var content = req.body.content;
        if (content == "Give me the last job for 1 Elers Way, Thaxted, Dunmow, Essex, CM6 2FN") {

            var title = "Here is the last job for 1 Elers Way, Thaxted, Dunmow, Essex, CM6 2FN";
            var jobs = "*Job*:540223896\n";
            jobs = jobs + "*Job No*:907198\n";

            jobs = jobs + "*Issued*: 21 Nov 2015 / 12:06\n";
            jobs = jobs + "*Description*: Please send out a temporary heater.\n";
            jobs = jobs + "*Received*: Saturday 21 November 2015 @12:06 (by Miss L Sullivan 01371831634)\n";
            jobs = jobs + "*Job Type*: Carpenter\n";
            jobs = jobs + "*Priority*: 00 - OOH\n";
            jobs = jobs + "Click [here](https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223896) to view the full job detail.";


            var spaceId = req.body.spaceId;

            request.post(
                'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages',
                {
                    headers: {
                        'Authorization': 'Bearer ' + storage.getItem('token'),
                        'spaceid': spaceId

                    },
                    body: {
                        "type": "appMessage",
                        "version": "1",

                        "annotations": [
                            {

                                "type": "generic",
                                "version": "1",

                                "color": "#36a64f",
                                "title": title,
                                "text": jobs,

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


        if (content == "Give me all the jobs in the last month for 1 Elers Way, Thaxted, Dunmow, Essex, CM6 2FN") {

            var title = "Here are all the jobs for '1 Elers Way, Thaxted, Dunmow, Essex, CM6 2FN' from 6th June 2017 to 6th July 2017";
            var jobs = "*Job*:540223896\n";
            jobs = jobs + "*Job No*:907198\n";

            jobs = jobs + "*Issued*: 21 Nov 2015 / 12:06\n";
            jobs = jobs + "*Description*: Please send out a temporary heater.\n";
            jobs = jobs + "*Received*: Saturday 21 November 2015 @12:06 (by Miss L Sullivan 01371831634)\n";
            jobs = jobs + "*Job Type*: Carpenter\n";
            jobs = jobs + "*Priority*: 00 - OOH\n";
            jobs = jobs + "Click [here](https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223896) to view the full job detail.\n\n";
            jobs = jobs + "------------------------------------\n";
            jobs = jobs + "*Job*:540223886\n";
            jobs = jobs + "*Job No*: No. 1 907192 , No. 2 13353 , No. 3 606526 \n";

            jobs = jobs + "*Issued*: 20 Nov 2015 / 22:44 \n";
            jobs = jobs + "*Due*: 21 Nov 2015 / 22:44 \n";
            jobs = jobs + "*Completed*: 21 Nov 2015 / 05:06 \n";
            jobs = jobs + "*Description*: Electricity problem nothing going to gas boiler. No heating or hot water Disabled tenant. Children under 5.\n";
            jobs = jobs + "*Received*: Friday 20 November 2015 @22:44  (by Miss Layla Sullivan 01371831634)\n";
            jobs = jobs + "*Job Type*: Electrician\n";
            jobs = jobs + "*Priority*: 00 - OOH\n";
            jobs = jobs + "Click [here](https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223886) to view the full job detail.\n\n";
            jobs = jobs + "------------------------------------\n";
            jobs = jobs + "*Job*:540262742\n";
            jobs = jobs + "*Job No*: No. 1 R913 , No. 2 R913\n";

            jobs = jobs + "*Issued*: 03 Jul 2017 / 10:08\n";
            jobs = jobs + "*Description*: Testing\n";
            jobs = jobs + "*Received*: Monday 3 July 2017 @10:08  (by Miss Sulli L Sullivan Tel:01371831634 Mob:07956163577)\n";
            jobs = jobs + "*Job Type*: Response\n";
            jobs = jobs + "*Priority*: 12 - 12 Calendar Days\n";
            jobs = jobs + "*Appointment Date*: Monday 3 July 2017 / 11:00  \n";
            jobs = jobs + "Click [here](https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223896) to view the full job detail.\n\n";
            jobs = jobs + "------------------------------------\n";


            var spaceId = req.body.spaceId;

            request.post(
                'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages',
                {
                    headers: {
                        'Authorization': 'Bearer ' + storage.getItem('token'),
                        'spaceid': spaceId

                    },
                    body: {
                        "type": "appMessage",
                        "version": "1",

                        "annotations": [
                            {

                                "type": "generic",
                                "version": "1",

                                "color": "#36a64f",
                                "title": title,
                                "text": jobs,

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
    }

    if (req.body.annotationType == 'actionSelected') {



        console.log(JSON.parse(req.body.annotationPayload).actionId);

        var createTargetedMessage = ""
        if (JSON.parse(req.body.annotationPayload).actionId=="Display Job") {

            createTargetedMessage = "mutation {createTargetedMessage(input: {conversationId: \"" + req.body.spaceId + "\", targetDialogId: \"" + JSON.parse(req.body.annotationPayload).targetDialogId + "\", targetUserId: \"" + req.body.userId + "\", annotations: [{genericAnnotation: {text: \"text\"}}], ";
            createTargetedMessage = createTargetedMessage +  "attachments: [";


            var title1 = "Please send out a temporary heater";
            var subtitle1 = "Completed";

            var text1 = "https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223896 ";
            text1 = text1 + "Job No 907198 was Issued on 21 Nov 2015 / 12:06. ";
            text1 = text1 + "Request is to 'Please send out a temporary heater'. ";
            text1 = text1 + "Job received on Saturday 21 November 2015 @12:06 by Miss L Sullivan. ";
            text1 = text1 + "Job Type is Carpenter with a Priority of 00 - OOH.";

            //text1 = text1 +  "https://mcmviewtest.mearsgroup.co.uk/Supervisor/540000000#/job/540223896) to view the full job detail.";

            createTargetedMessage = createTargetedMessage +  "{type: CARD, cardInput: {type: INFORMATION, informationCardInput: {title: \"" + title1 + "\", text: \""+text1+"\", subtitle: \"" + subtitle1 + "\", date: \"1499158974426\", buttons: [{text: \"View Job\", payload: \"payload\", style: PRIMARY}] }}}";


            var card_title2 = ""

            var card_text2 = ""
            createTargetedMessage = createTargetedMessage +  ",{type: CARD, cardInput: {type: INFORMATION, informationCardInput: {title: \"informationcardtitle\", text: \"text\", subtitle: \"subtitle\", date: \"1499158974426\", buttons: [{text: \"text\", payload: \"payload\", style: PRIMARY}] }}}";
            createTargetedMessage = createTargetedMessage +  "]}) {successful}}";

        } else {
            createTargetedMessage = "mutation {createTargetedMessage(input: {conversationId: \"" + req.body.spaceId + "\", targetDialogId: \"" + JSON.parse(req.body.annotationPayload).targetDialogId + "\", targetUserId: \"" + req.body.userId + "\", annotations: [{genericAnnotation: {title: \"" + title + "\" , text: \"" + text + "\"}}  ]  }) {successful}} "
        }

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
