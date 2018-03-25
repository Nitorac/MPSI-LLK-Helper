'use strict';
var store = require('./.data/savedStore.js');
var utils = require('./utils.js');

function checkName(request){
  return store.eleves.hasOwnProperty(request);
}

function getClonedStore(jsonObjName){
  return JSON.parse(JSON.stringify(store[jsonObjName]));
}

function getCellFromEpoch(epoch,colle_gpe){
   return getClonedStore('planning')[epoch][colle_gpe];
}

function getnNextColles(colle_gpe, n){
  var offset = 0;
  var result = [];
  while(result.length < n+2){
    var mondayEpoch = utils.getMondayEpoch(offset);
    if(isNaN(mondayEpoch)){
      break;
    }

    var cells = getCellFromEpoch(mondayEpoch, colle_gpe).split("-");
    var copiedColleursStore = getClonedStore('colleurs');
    var colles = [copiedColleursStore[cells[0]], copiedColleursStore[cells[1]]].sort(function (a,b){
      return (a.Epoch > b.Epoch) ? 1 : -1;
    });
        
    for(var i = 0;i<colles.length;i++){
      if(colles[i] === undefined){
        console.log("Colle défaillante : monday=" + mondayEpoch);
        return result;
      }
      var absoluteEpoch = mondayEpoch + parseInt(colles[i].Epoch);
      if(utils.nowEpochGmt() < absoluteEpoch && result.length < n && !(colles[i] === undefined)){
        colles[i].absoluteEpoch = absoluteEpoch;
        result.push(colles[i]);
      }
    }
    offset++;
  }
          
  return result.filter(function(n){ return n != undefined });
}

module.exports = {
  checkName: checkName,
  getCellFromEpoch: getCellFromEpoch,
  getnNextColles: getnNextColles
}