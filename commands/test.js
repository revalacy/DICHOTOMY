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

exports.run = (client, message, [name, action, ...args]) => {//change args to whatever arg variables need to be defined up-front.
  
 var announcementroom = client.channels.get('481931772540485648'); //the room where the event announcement will go when using /event label open; outside of testing this should be 503634158308818954
  var registrationroom = client.channels.get('390953758944788482'); //this will be the room people are told to register in. It will be the bot room when the command goes live

  
  async function resolve(){
    var eventlabel = 'Test';
    var npcstring = await fn.getproperty(7, eventlabel, 'npcs');
    var npcs = npcstring.split(',');
    npcs = npcs.filter(npc => npc != '');
    var len = npcs.length;
    console.log('len = ' + len);
    console.log('Setting timeout functions');

    

    }

  
  async function messagehandler (a, b){
  var msgarray = a;
  var chnlid = b;
  var timeoutstack = []
  function doSetTimeout(i) {
  setTimeout(function() { chnlid.send('```' + msgarray[i] + '```'); }, timeoutstack[i]);
  }
  for (var i = 0; i < msgarray.length; i++){
   timeoutstack[i] = 5000 * i;
   doSetTimeout(i);
  }}
  
  resolve();
  
}
