const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, ...targetstring]) => {
  
  if (!name) return message.channel.send('You must include the character name in your command!');
  //Arguments: Name, Target, Object

 var target = targetstring.join(' ');
 var user = message.author.id;
 var cmdgen = 'investigate';
 var cost = 3;

async function resolve(){
        //command flow: /investigate Name target string; pull Name's needed properties and run owner check, cooldown check. Set target search keys as array. Pull target's index. Pull target's properties. Location check. Check investigations string for Name. If it doesn't exist, make a new one. Create roll, stat, bonus, add total. Remove found clues from investigations string. Check first clue for threshold, if it passes use it, if it doesn't check the next. Add new total to existing total, reset string. Get message, send.
        //get all necessary variables to begin
        var [owner, per, int, location, bonus, namestring] = await fn.getval(2, name, ['userid', 'per', 'int', 'location', 'bonus', 'friendlyname']);
        var targetindex = await fn.getproperty(13, target, 'indexval');
  console.log('index get');
        var keys = ['hasclues', 'investigations', 'location', 'description', 'friendlyname'];
        var targetdata = await fn.getval(targetindex, target, keys);
        var roomtype = message.channel.type;
        var room = message.channel.id;
        var stat = Math.max(+per, +int);
        var roll = Math.floor(Math.random() *10) +1;
        var rolltotal = +roll + +stat + +bonus;
        var roomstring = ('[' + room + ']');
        var z;
        var blockmsg = await fn.getproperty(4, roomtype, 'replace');
        blockmsg = blockmsg.replace('#', name);
        var msg;
        var eventmsg = ('**#** rolls **#** to investigate **#**. What do they find?');
        var announcementroom = client.channels.get('481931772540485648');//id should change to 503634158308818954 in prod
        var targetname = targetdata[4];
        //run necessary checks: owner, location, cooldown
        if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//owner check
        if (targetdata[2] != location && targetdata[2] != name && location != target) return message.channel.send('An item must be near you to investigate it. You will need to /move to the location where that object is presently.');//location check
        //cooldown check
        if (roomtype === 'dm'){//non-event cooldown check
            var cdend;
            var now = new Date();
            var difference;
            [z, cdend] = await fn.cooldowntimer(cmdgen, name);
            if (z === 0) {
              msg = await fn.getproperty(4, '0', 'investigate'); 
              difference = (cdend - now)/60/1000; 
              difference = Math.ceil(difference); 
              msg = msg.replace('#', name).replace('#', difference);
              return message.author.send(msg);
            };
        };
        if (roomtype === 'text'){//event cooldown check
               z = await fn.eventcdcheck(name, roomstring);
               var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
               if (z === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
               if (z < cost) return message.channel.send(namestring + ' does not have enough action points to go through the attack! Remaining points: ' + z);
               var actionpoints = +z - +cost;
               fn.setcooldown(name, roomstring, actionpoints);
        };

        //if all checks have been passed at this point, proceed to investigation.
        var clues = targetdata[0];
        var cluesremaining = clues;
        var investigationstring = targetdata[1];
        eventmsg = eventmsg.replace('#', name).replace('#', rolltotal).replace('#', targetname);
        if (roomtype === 'text') message.channel.send(eventmsg);

        if (investigationstring === '') investigationstring = name + '|' + 0 + '|' + 'none;';//if investigation string is blank, set new string

        var ii = investigationstring.indexOf(name);
        if (ii === -1) investigationstring = investigationstring + name + '|' + 0 + '|' + 'none;'//set investigation string up for evaluation
        var investigations = investigationstring.split(';').filter(inv => inv != '');
        var len = investigations.length;
        var stringval;
        for (var i = 0; i < len; i++){
            var checkstring = investigations[i];
            var [a, b, c] = checkstring.split('|');
            if (a != name) continue;
            stringval = checkstring;
            break;
        };
        console.log('stringval = ' + stringval);
        var [char, total, cluesfoundstring] = stringval.split('|');//filter out all clues that have already been discovered
        total = parseInt(total);
        total += rolltotal;
        var cluesfound = cluesfoundstring.split(',').filter(x => x != '');
        console.log('cluesfound = ' + cluesfound);
        for (var i = 0; i < cluesfound.length; i++){
            var clue = cluesfound[i];
            var cluestring = (clue + ',');
            console.log('clue = ' + clue);
            var n = cluesremaining.indexOf(clue);
            console.log('n = ' + n);
            if (n === -1) continue;
            if (cluesremaining === clue) cluestring = clue;
            cluesremaining = cluesremaining.replace(cluestring, '');
              console.log('cluesremaining = ' + cluesremaining);//all remaining clues in the string are viable to pull for discovery
        };
    console.log(cluesremaining)
  if (cluesremaining === '' || cluesremaining === 'undefined') return message.author.send(name + ' has already uncovered all available clues for ' + targetname + ' right now. New clues may be added later!');
        var newstring;
        var cluescheck = cluesremaining.split(',');
        cluescheck = cluescheck.filter(x => x != '');
        for (var e = 0; e < cluescheck.length; e++){
            clue = cluescheck[e];
            console.log('checking clue ' + clue);
            var clueindex = await fn.getproperty(13, clue, 'indexval');
            var [threshold, description] = await fn.getval(clueindex, clue, ['hideval', 'findmsg']);
            description = description.replace('#', name);
            clue = ',' + clue;
            if (total < threshold) {
              msg = await fn.getproperty(4, '3', 'investigate'); 
              msg = [msg.replace('#', name)]; 
              clue = ''; 
              if (e < cluescheck.length) continue;
                break;
            };
            msg = await fn.getproperty(4, '4', 'investigate');
            msg= msg.replace('#', name);
            msg = [msg, description];
            break;
        };
  
        cluesfoundstring = cluesfoundstring + clue;
        if (cluesfoundstring != 'none') cluesfoundstring = cluesfoundstring.replace('none,', '');
        newstring = (name + '|' + total + '|' + cluesfoundstring);
        investigationstring = investigationstring.replace(checkstring, newstring);
        fn.setval(targetindex, target, ['investigations'], [investigationstring]);
        messagehandler(msg);
  }
async function messagehandler (a, b){
var msgarray = a;
var channelid = b;
var timeoutstack = []
function doSetTimeout(i) {
setTimeout(function() { 
  msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('<>','');
  var n = msgarray[i].indexOf('<');
  console.log('n = ' + n);
  if (n != -1) {var [replacemsg, url] = msgarray[i].split('<'); console.log(url); msgarray[i] = (replacemsg + '```'); url = url.replace('>```', ''); console.log(msgarray[i] + ';' + url); message.author.send(msgarray[i], {files: [url]});};
  if (n === -1) message.author.send(msgarray[i]);
}, timeoutstack[i]);
}
for (var i = 0; i < msgarray.length; i++){
 timeoutstack[i] = 5000 * i;
 doSetTimeout(i);
}}

  resolve();
}