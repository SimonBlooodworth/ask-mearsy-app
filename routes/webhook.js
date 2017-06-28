// Sign and verify Watson Work requests and responses

// Feel free to adapt to your particular security and hosting environment

var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const debug = require('debug');

var bparser = require('body-parser');

const APP_ID = "639b18ea-dcaa-4da5-bc8a-f1cf2c26acd2";
const APP_SECRET = "foq4haxi8ivi01fgmd91rbbcpmhqthoy";
const WEBHOOK_SECRET = "q67u35d3f9h3cips9x8ud2ujmqetpjbr";


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
    }

    res.send();

});

/* Listen on Webhook */
router.get('/', function(req, res, next) {
    res.send('Get method on webhook');

});

module.exports = router;
