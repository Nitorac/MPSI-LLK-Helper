'use strict';
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var db = low(new FileSync('.data/savedUsers.json'));

var store = require('../.data/savedStore.js');
var executor = require('../planningExecutor.js');
var utils = require('../utils.js');

const collesLimit = 50;

module.exports = (bot) => {
  
  bot.hear(/unset.*/i, (payload, chat) => {
    db.unset(payload.sender.id).write();
    chat.say(`Votre nom a bien été supprimé de la base de données !`);
  });
  
  bot.hear(/colles? ([A-Za-z][A-Za-z]*)\s?|kh[ôo]lles? ([A-Za-z][A-Za-z]*)\s?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    const otherName = (data.match[1] != undefined) ? data.match[1] : "invalid";
    processHear(payload, chat, 2, otherName, false, otherName);
  });
  
  bot.hear(/colles? ([0-9]+) ([A-Za-z][A-Za-z]*)\s?|kh[ôo]lles? ([0-9]+) ([A-Za-z][A-Za-z]*)\s?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    var num = parseInt(data.match[1]);
    if(isNaN(num)){
      chat.say("Vous n'avez pas entré un nombre valide en premier argument !");
      return;
    }
    
    if(num > collesLimit){
      chat.say("Le nombre de colles est trop grand !");
      return;
    }
    
    const otherName = (data.match[2] != undefined) ? data.match[2] : "invalid";
    processHear(payload, chat, num, otherName, false, otherName);
  });
  
  bot.hear(/colles? ([0-9]+)|kh[ôo]lles? ([0-9]+)/i, (payload, chat, data) => {
    if (data.captured) { return; }
    var num = parseInt(data.match[1]);
    if(isNaN(num)){
      chat.say("Vous n'avez pas entré un nombre valide en premier argument !");
      return;
    }
    if(num != undefined && num > collesLimit){
      chat.say("Le nombre de colles est trop grand !");
      return;
    }
    processHear(payload, chat, num, (db.has(payload.sender.id).value()) ? db.get(payload.sender.id).value() : undefined, true, undefined);
  });
  
  bot.hear(/colles?|kh[ôo]lles?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    processHear(payload, chat, 2, (db.has(payload.sender.id).value()) ? db.get(payload.sender.id).value() : undefined, true, undefined);
  });
  
  function processHear(payload, chat, n, name, hasToDefine, otherNameToDisplay){
    if(name == undefined){
      chat.conversation((convo) => {
        convo.say(`Je ne trouve pas votre nom dans la base de données...`);
        askName(convo, n);
      });
      return;
    }
    
    var actName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    if(!executor.checkName(actName) && hasToDefine){
      chat.conversation((convo) => {
        convo.say(`Je ne trouve pas votre identité dans la base de données...`);
        askName(convo, n);
      });
    }else if(!executor.checkName(actName)){
      chat.say('Le nom ' + actName + ' est introuvable dans la base de données');
    }else{
      showColle(chat, payload, n, actName, otherNameToDisplay); 
    }
  }
  
  function showColle(chatconv, payload, n, name, otherName){
    chatconv.say(`Veuillez patienter ...`);
    var result = executor.getnNextColles(store.eleves[name].Colle_groupe, n);
    var message = (otherName === undefined) ? 'Vos ' + n + ' prochaines colles sont :\n' : 'Les ' + n + ' prochaines colles de ' + store.eleves[name].Prenom + ' sont :\n';
    for(var i = 0;i < result.length;i++){
      var c = result[i];
      var start = new Date(0);
      start.setUTCSeconds(c.absoluteEpoch);
      var end = new Date(0);
      end.setUTCSeconds(c.absoluteEpoch + c.DureeEpoch);
      var sub = '\n\n↬  ' + utils.getPrefix(c.Sexe) + c.Nom + " le " + utils.getFormattedDay(start.getUTCDay()) + " " + utils.formatDate(start) + 
          " de " + formattedHour(start.getUTCHours(), start.getUTCMinutes()) + 
          " à " + formattedHour(end.getUTCHours(), end.getUTCMinutes()) + " (" + c.Matiere + ")";
      message+=sub;
    }
    chatconv.say(message, {typing: true});
  }
  
  const askName = (convo, n, otherName, redirect) => {
    convo.ask(`Entrez votre nom de famille (sans espace ni accent)`, (payload, convo, data) => {
      var actName = payload.message.text.trim();
      if(executor.checkName((actName = actName.charAt(0).toUpperCase() + actName.slice(1).toLowerCase()))){
        convo.say(`Votre nom est donc ${actName}.`);
        convo.getUserProfile().then((user) => {
          db.set(payload.sender.id, actName).write();
          var json = db.get(payload.sender.id).value();
          convo.say(`Hello, ${user.first_name} ! La base de données dit que votre nom est ${json}`);
          convo.end();
          showColle(convo, payload, n, actName, otherName);
        });
      }else{
        convo.say(`Je ne connais pas ce nom, réessayez en vérifiant qu'il n'y a pas d'erreurs ...`).then(() => askName(convo, n, otherName));
      }
    });
  };
  
  function formattedHour(hour, minute){
    var forMin = (minute == 0) ? "" : utils.addZero(minute);
    return utils.addZero(hour) + "h" + forMin;
  }
};