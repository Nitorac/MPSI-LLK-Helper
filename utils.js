'use strict';
var stored = require('./.data/savedStore.js');
const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const db_table= "CREATE TABLE `registry` ( `ID` INTEGER PRIMARY KEY AUTOINCREMENT, `SenderID` text NOT NULL, `Path` text NOT NULL,`Title` text NOT NULL,`Epoch` INTEGER NOT NULL,`MondayEpoch` INTEGER NOT NULL,`Infos` text NOT NULL)";
const puce_rnd_colors = ["https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F1.png?1521926735486","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F0.png?1521926735774","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F2.png?1521926735940","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F4.png?1521926736080","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F6.png?1521926736192","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F5.png?1521926736356","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F3.png?1521926736490","https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2F7.png?1521926736638"];

function nowEpochGmt(){
  return parseInt((Date.now() - new Date(Date.now()).getTimezoneOffset()*60000)/1000);
}

function nowEpoch(){
  return parseInt(Date.now()/1000);
}

function getFormattedDay(dayInt){
  return days[dayInt];
}

function isAdmin(senderId){
  return senderId == process.env.ADMIN_MESSENGERID
}

function getPrefix(prefix){
  return (prefix === "F") ? "Mme " : "M. ";
}

function plural(n, str, exceptPlur){
  if(n > 1){
    return (exceptPlur == undefined) ? str+"s" : exceptPlur;
  }else{
    return str;
  }
}

//offset=0 => current Week Monday ;  offset=1 => next Week Monday
function getMondayEpoch(offset){
  var epochs = Object.keys(stored.planning).sort();
  var currentGmt = nowEpochGmt();
  for(var i = epochs.length-1; i > 0; i--){
    if(currentGmt > parseInt(epochs[i])){
      return parseInt(epochs[i+offset]);
    }
  }
  return -10000;
}

function formatDate(date){
  return addZero(date.getUTCDate().toString()) + "/" + addZero((date.getUTCMonth()+1).toString()) + "/" + date.getUTCFullYear();
}

function formatHour(date, isUTC){
  return addZero(((isUTC != undefined && isUTC) ? date.getUTCHours() : date.getHours()).toString()) + ":" + addZero(((isUTC != undefined && isUTC) ? date.getUTCMinutes() : date.getMinutes()).toString()) + ":" + addZero(((isUTC != undefined && isUTC) ? date.getUTCSeconds() : date.getSeconds()).toString());
}

function addZero(str){
  return (str.length < 2) ? "0" + str : str;
}

function getRandomNoFollow(start, end, nbOfValues){
  var result = [Math.floor((Math.random() * (end+1-start)) + start)];
  var limit = nbOfValues + 60;
  var count = 0;
  var lastValue = result[0];
  while(result.length < nbOfValues){
    var x = Math.floor((Math.random() * (end+1-start)) + start);
    if(x != lastValue || count > limit){
      result.push(x);
      lastValue = x;
    }
    count++;
  }
  return result;
}

module.exports = {
  puce_rnd_colors: puce_rnd_colors,
  db_table: db_table,
  getMondayEpoch: getMondayEpoch,
  nowEpoch: nowEpoch,
  nowEpochGmt: nowEpochGmt,
  getPrefix: getPrefix,
  formatDate: formatDate,
  formatHour: formatHour,
  addZero: addZero,
  isAdmin: isAdmin,
  getRandomNoFollow: getRandomNoFollow,
  getFormattedDay: getFormattedDay,
  plural: plural
}