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

const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, ...targetstring]) => {
  
  if (!name) return message.channel.send('You must include the character name in your command!');
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting Send');
var target = targetstring.join(' ');
var cmdgen = ("investigate");
var namestring = ('**' + name + '**');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  console.log('Owner verified, starting data collection for command');
  //pull name's intelligence, perception, bonus, set stat to the greater of intelligence or perception and add roll, stat and bonus together for total
  console.log('Pulling user stats.');
var [int, per, bonus, inevent, cooldowns, location] = await fn.getval(2, name, ['int','per','bonus','inevent','cooldowns', 'location']); 
  var stat;
  if(+int > +per) stat = int;
  if(+int <= +per) stat = per;
  console.log('Stat pull complete. Pulling index of target.');
//pull target's index, location, cluekey. If location isn't name or name's location, or if name's location isn't the target, return 'you have to be near something to investigate it!'; if hasclues is 0 'there doesn't seem to be anything remarkable about this object'
var targetindex = await fn.getproperty(13, target, 'indexval');
  var targetname = target;
  if (targetindex === '8') targetname = fn.getproperty(8, target, 'friendlyname');
  if (targetindex === '2') return message.channel.send('Character investigations are not yet supported, please try investigating a place or object instead.');
  console.log('Target index obtained. Preparing investigation data.');
var cluekey = 'hasclues';
var clueindex = 10;
if (targetindex === '8'){ 
  cluekey = 'hashiddenobjects'
  clueindex = 9;                       
                        };
  console.log('Pulling target data.');
var [searchtargets, investigationstring, hideval, targetlocation] = await fn.getval(targetindex, target, [cluekey, 'investigations', 'hideval','location']);
var proxmessage = ('You must be near something to investigate it!');
if (targetindex === '8' && location != target) return message.channe.send(proxmessage);
if (searchtargets === '') return message.channel.send('It doesn\'t look like there\'s anything interesting to learn about ' + targetname + '.')
var announcementroom = client.channels.get('503634158308818954');
var blockedmsg1 = ('That action is currently on cooldown for ' + namestring + ', please try again later. The cooldown for investigations is 20 minutes outside of events.');
var blockedmsg2 = (namestring + ' cannot use an action at this time. Either you have already acted, or the action window has ended. Please wait for the next action round or consult a GM.');
var z;
var blockmsg;
var roomtype = message.channel.type;//get channel type. if the type is dm, check for cooldown and pass in message, if type is text, pull room id and check for active event and registration
  console.log('Checking room type.');
if (roomtype === 'dm'){ 
  z = await fn.dmcooldownreset(cmdgen, cooldowns, name);
  console.log('z = ' + z);
  blockmsg = blockedmsg1;
  
  };
if (roomtype === 'text'){
  var roomused = message.channel.id;
  var f = await fn.eventproperty(roomused, 'registered');
  if (f === 'none'|| f === '') return message.channel.send('There is not an active event in this room! If you\'d like to register for an active or pending event, please head to ' + announcementroom + ' to get details.');
  z = await fn.eventcdcheck(name, roomused);
  blockmsg = blockedmsg2;
};
  var msg = ('You have learned all there is to know about ' + targetname + '.');
  if (z === 0) return message.channel.send(blockmsg);
  
  console.log('Getting roll data.');
  var roll = Math.floor(Math.random()*10)+1;
  //pull target's details, pull name's details, get roll values, check thresholds, return response
  var rolltotal = +roll + +stat + +bonus;
  //split and check investigations for existing data
  console.log('Pulling investigation data from target.');
  var searchstring = searchtargets.split(',').join(';');
  var ii = investigationstring.indexOf(name);
  if (ii === -1) {
    investigations = (name + '|' + 0 + '|' + searchstring + ',');
    investigationstring = investigationstring + investigations;
  };
  
  console.log('Evaluating investigation data.');
  var investigations = investigationstring.split(',');
  for (var nm = 0; nm < investigations.length; nm++){
            var currentinvest = investigations[nm];
            if (currentinvest === '') continue;
            var ni = currentinvest.indexOf(name);
            if (ni === -1) continue;
            var [stringname, totalthreshold, remainingclues] = currentinvest.split('|');
            if (remainingclues === 'cap') continue;
            var newtotal = +totalthreshold + +rolltotal;
            var clues = remainingclues.split(';');
            var clue = clues[0];
            var [minimum,findmsg] = await fn.getval(clueindex, clue, ['hideval','findmessage']);
            if (+newtotal < +minimum) findmsg = ('Nothing about ' + targetname + ' seems to stand out to you right now. Perhaps another look later?');
            var cluevalstring = (clue + ';');
               var removestring = remainingclues;
    if (+newtotal > +minimum) removestring = remainingclues.replace(cluevalstring,'');
               if (removestring === '') removestring = 'cap';
               var replacementstring = (name + '|' + newtotal + '|' + removestring);
            var newinvestigations = investigationstring.replace(currentinvest,replacementstring);
              fn.setval(targetindex, target, ['investigations'],[newinvestigations]);
            }
  var rollresult = await fn.getproperty(4, rolltotal, 'replace');
            msg = (namestring + ' ' +rollresult + '! ' + findmsg);
  if (roomtype === 'text'){ 
    var room = message.channel.id;
    message.channel.send(namestring + ' rolls to investigate and takes a closer look at ' + targetname + '. What do you see? Find out by checking your DMs!');
      var hasactedstring = await fn.eventproperty(room,'hasacted');
   var newstring = (hasactedstring + name +',');
   fn.eventmodifyval(room,['hasacted'],[newstring]);                     
                          };
    message.author.send(msg);
  
  fn.effectexecute(name, target, cmdgen);
  console.log('Investigation complete.');
  
  //
  }
  
  resolve();
}