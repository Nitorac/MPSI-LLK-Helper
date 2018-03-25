'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var utils = require('./utils.js');
var exosColleExec = require('./exosColleExecutor.js');

const request = require('request');
const path = require('path');

const BootBot = require('bootbot');

app.set('port', 3000)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const bot = new BootBot({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});

bot.module(require('./modules/echo.js'));
bot.module(require('./modules/giphy.js'));
bot.module(require('./modules/get_colle.js'));
bot.module(require('./modules/exos_colle.js'));
bot.module(require('./.data/hiddenCommands.js'));
bot.module(require('./modules/sites.js'));
bot.module(require('./modules/help.js'));

bot.on('authentication', (payload, chat, data) => {
    chat.say(`Pour voir la liste des commandes, tapez 'aide' ou 'help'`);
});

bot.on('attachment', (payload, chat, data) => {
    chat.say(`Il est possible qu'une mise à jour ait été appliquée avant l'envoi de votre document ou de votre réaction :/\nVeuillez réexécuter la commande !`);
});

bot.setGetStartedButton((payload, chat, data) => {
    chat.say(`Pour voir la liste des commandes, tapez 'aide' ou 'help'`);
});

app.get('/', function(req, res) {
  res.send("It works ;)")
})

app.get('/webhook', (req, res) => {
      if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === this.verifyToken) {
        console.log('Validation Succeded.')
        res.status(200).send(req.query['hub.challenge']);
      } else {
        console.error('Failed validation. Make sure the validation tokens match.');
        res.sendStatus(403);
      }
});

app.post('/webhook', (req, res) => {
  var data = req.body;
  if (data.object !== 'page') {
    return;
  }
  bot.handleFacebookData(data);
  res.sendStatus(200);
});

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
});

module.exports = {
  bot: bot
}