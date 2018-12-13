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

exports.run = (client, message, [name, event, ...args]) => {//change args to whatever arg variables need to be defined up-front.
  
 var announcementroom = client.channels.get('481931772540485648'); //the room where the event announcement will go when using /event label open; outside of testing this should be 503634158308818954
 var registrationroom = client.channels.get('390953758944788482'); //this will be the room people are told to register in. It will be the bot room when the command goes live
 
  
  async function resolve(){
    var cmdgen = 'resolve';
    console.log('resolve 1');
    var arraymessages = [];
    var arrayfiles = [];
    var [room, registered, npcs] = await fn.getval(7, name, ['room', 'registered', 'npcs']);
    var participants = npcs + registered;
    var participantstrings = participants.split(',');
    participantstrings = participantstrings.filter(p => p!= '');
    var plen = participantstrings.length;
    console.log('resolve 2');
    for (var y = 0; y < plen; y++){
        var participant = participantstrings[y];
        await fn.hpres(participant, cmdgen);
    };
    room = room.replace('[','').replace(']','');
    var roomid = client.channels.get(room);
    console.log('resolve 3');
    var stringval = await fn.npcstatuscheck(name);
    console.log('stringval = ' + stringval);
    if (stringval != '') {
    var strings = stringval.split(',[');
    var len = strings.length;
    console.log('resolve 4');
    for (var i = 0; i < len; i++){
    var string = strings[i];
    var [msg, url] = string.split('<');
    console.log('url = ' + url);
    if (url != 'undefined') url = url.replace('>]', '');
    if (msg != 'undefined') {msg = msg.replace('[','');
    msg = '```' + msg + '```';}
    arraymessages[i] = msg;
    arrayfiles [i] = url;
    console.log('msg = ' + msg);
    console.log('url = ' + url);
    };
    };
    console.log('resolve 5');
    if (stringval != '') messagehandler (arraymessages, roomid, arrayfiles);
    for (var x = 0; x < plen; x++){
      var particp = participantstrings[x];
      await fn.cleareventcd(particp, name);
    };
    }

  
  async function messagehandler (a, b, c){
  var msgarray = a;
  var chnlid = b;
  var filearray = c;
  var timeoutstack = []
  function doSetTimeout(i) {
  setTimeout(function() { 
    if (!filearray[i]) chnlid.send(msgarray[i]);
    if (filearray[i] != '') chnlid.send(msgarray[i], {files: [filearray[i]]}); }, timeoutstack[i]);
  }
  for (var i = 0; i < msgarray.length; i++){
   timeoutstack[i] = 5000 * i;
   doSetTimeout(i);
  }}
  
  resolve();
  
}

//roomid.send(msg, {files: [url]});