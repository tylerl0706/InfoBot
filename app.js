var restify = require('restify');
var builder = require('botbuilder');
var nav = require('./nav');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

process.env.MICROSOFT_APP_ID = '94d53a41-1270-4300-a269-df272b6bee9e';
process.env.MICROSOFT_APP_PASSWORD = 'Qa1Bf0pgpJytd2AgtpsT0er';

// Create chat bot
var connector = new builder.ChatConnector({
    appId: '94d53a41-1270-4300-a269-df272b6bee9e',
    appPassword: 'Qa1Bf0pgpJytd2AgtpsT0er'
});

console.log(connector);

var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {    
        if (!session.userData.authed) {
            session.beginDialog('/auth');
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        if(session.userData.state == undefined){
            session.userData.state = [];
            session.userData.stateObj = nav;
        }

        let keysArr = Object.keys(session.userData.stateObj);
        if (keysArr.indexOf(session.message.text) != -1){
            proceed(session);
        } else {
            let lowerCaseText = session.message.text.toLowerCase();
            if(lowerCaseText.indexOf('description')
                || lowerCaseText.indexOf('help')
                || lowerCaseText.indexOf('info')){
            }
            if(!session.userData.state.length){
                session.send('Hello %s!', session.userData.name);
                session.send('What can I help you with?:');
                session.send(keysArr.join(', '));
            }else{
                session.send('I\'m not sure I understand... pick one of these:');
                session.send(keysArr.join(', '));
            }
        }
    }
]);

// intents.matches(/^list/i, [
//     session => {
//         var keysArr = Object.keys(session.userData.stateObj);
//         session.send(keys.Arr.join('\n'));
//     }
// ])

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/auth', [
    function (session) {
        builder.Prompts.text(session, 'What is the password?');
    },
    function (session, results) {
        session.userData.authed = results.response == 'pass';
        session.endDialog();
    }
]);


function proceed(session) {
    let answer = session.message.text;
    session.send('ok so "%s". Let me get that for you...', answer);
    if(typeof session.userData.stateObj[answer] === 'string'){
        session.send('Here you go!');
        session.send(session.userData.stateObj[answer]);
        session.send('Let me take you back to the main menu');
        session.userData.stateObj = nav;
        session.userData.state = [];
    }else{
        //prompt for more
        session.send('Now pick from this list:');
        session.send(Object.keys(session.userData.stateObj[answer]).join(', '));
        session.userData.state.push(answer);
        session.userData.stateObj = session.userData.stateObj[answer];
    }
}



function search(value) {
    var hits = [];
    for (var key in data) {
        var regex = new RegExp(`^${key}`, 'i');
        if (regex.exec(value)) {

            hits.push(data[key]);
        }
    }
    return hits;
}