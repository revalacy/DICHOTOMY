const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const eventdoc = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    eventdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});

var fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, action]) => {//change args to whatever arg variables need to be defined up-front.
  
  var room = message.channel.id;
  
  async function resolve(){
   console.log(room);
  }
    
//Get current stage, points, and min to compare

  
resolve();
  
}