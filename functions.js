const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./client_secret.json');
    const doc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const eventdoc = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    const devdoc = new GoogleSpreadsheet('1gttI85xdLuZZmWedz7nemrfBSlotJGD6n_qdcDSgHV0');//DEV Database
    doc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    eventdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    devdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
      console.log(err)});


//Remember that all async functions resolving promises must have their function variables declared as local variables BEFORE the Promise object

var efn = require('./effects.js');
var fn = require('./functions.js');


module.exports =  {
  
roll: async function(a, b){//returns number of successes
  var dice = a;
  var roller = b;
  var rollsarray = [];
  var successarray = [];
  var successes = 0;
  var botches = 0;
  for (var i = 0; i < dice; i++){
    var roll = Math.floor(Math.random() *10) + 1;
    var result;
    if (roll === 7 || roll === 8 || roll === 9) result = 1;
    if (roll === 10) result = 3;
    if (roll < 7) result = 0;
    if (roll === 1) this.doom(roller);
    if (roll === 1) botches = +botches + 1;
    successarray[i] = result;
    rollsarray[i] = roll;
    successes = successes + result;
  };
  console.log(successes);
  if (successes > 0) botches = 0;
  if (successes === 0 && rollsarray.indexOf(1) != -1) this.doom(b);
  return new Promise(resolve => {
      resolve([successes, rollsarray, botches]);
  });
},

indexpull: async function(a){  
    var searchval = a;
    var x;
    return new Promise(resolve => {
      doc.getRows(13, {'query': 'label = "' + searchval + '"'}, function(err,row){
        x = row[0].indexval;
        resolve(x);
      });
    });
},
rowpull: async function(a){

},
doom: async function(a){//adds a doom point
      let char = a; 
      doc.getRows(2,{
           'query':'label = "' + char + '"'
         },function (err,row){
           if (!row[0]) return console.log('An error has occurred, terminating the function Doom.');
           let old = row[0].doom;
           let doom = +old + 1;
           row[0].doom = doom;
           row[0].save()
         }
  )
},
setval: async function(a, b, c, d){//sets values to core database, accepts arguments keys and values in array form 
     let index = parseInt(a);
     let searchval = b;
     let keys = c;
     let values = d;
    console.log('Executing Setval function for ' + searchval + '.');
     doc.getRows(index, {'query': 'label = "' + searchval + '"'},function(err,row){
      if (!row[0]) return console.log('An error occurred. Terminating function setval.')
      for (var i = 0; i < keys.length; i++){
        let key = keys[i];
        let value = values[i]
        row[0][key] = value;
     }
        row[0].save();
        return;
    })
},
getval: async function(a, b, c){//pulls values from core database, accepts arguments keys and values in array form
     let index = parseInt(a);
     let searchval = b;
     let keys = c;
     var x = []
  return new Promise(resolve => {
   doc.getRows(index, {'query': 'label = "' + searchval + '"'},function(err,row){
      if (!row[0]) {x = ['none']; console.log('An error occurred during getval function execution. Unable to pull data for ' + searchval + '. Returning value "none".'); return resolve(x)};
      
     for (var i = 0; i < keys.length; i++){
        let key = keys[i];
        x[i] = row[0][key];
     }
    resolve (x);
    })
  })
},
addmadness: async function (a, b, c){//adds to Madness calc doc
   var dateObj = new Date();
           var month = dateObj.getUTCMonth() + 1; //months from 1-12
           var day = dateObj.getUTCDate();
           var year = dateObj.getUTCFullYear();
  let newdate = month + "/" + day + "/" + year;
  let char = a;
  let value = b;
  let command = c;
    doc.addRow(3,{label: char, date: newdate, value: value, commandgen: command},function(err){
      if (err) console.log(err);
    });
},
getstate: async function (a, b){//returns 0 or 1, used as boolean success/failure
      let total = a;
      let target = b;
      return new Promise(resolve => {
        var x = "0";
        var y = "1";
        if (+target > +total) return resolve (x);
        resolve (y);
      })
},
getproperty: async function (a, b, c){//pull single value from database
 let index = a;
 let char = b;
 let searchkey = c;
  
  return new Promise(resolve => {
    doc.getRows(+index, {'query': 'label = "' + char + '"'}, function(err, row){
      var x;
      if(!row[0]) {x = 'none'; console.log('An error occurred during property pull. Unable to pull data for ' + char + '.');return resolve(x)};
      x = row[0][searchkey];
      resolve (x);
    })
  })
},
effectexecute: async function (a, b, c){//executes effects on the target object
   var targets = a;
   var obj = b;
   var trgr = c;
   var index = await this.getproperty(13, targets, 'indexval');
    if (index === '8') targets = await this.getproperty(8, targets, 'occupants');
      console.log('targets = ' + targets);
    if (targets === '') return;
    var effectprop = await this.getproperty(9, obj, "effects")//get string of effect indexes for object
    var effects = effectprop.split(',');
    effects = effects.filter(e => e != '');
    var targetarray = targets.split(',');
   for (var y = 0; y < targetarray.length; y++) {
     let target = targetarray[y];
     if (target === '') continue;
  for (var i = 0; i < effects.length; i++){//for each effect index pull the propertiesindexval
    let effect = effects[i];
    var [changefunc, key, value, triggers, timerval] = await this.getval(11, effect, ["changefunc", "keys", "values", "triggers", "timerval"]);
    var n = triggers.indexOf(trgr);//check that trigger is good
    console.log(n);
    if (n === -1) continue;
    efn[changefunc](key, target, value, obj);//create execution function
  }
   }
  
},
effectreverse: async function(a, b, c){//reverses effects on the target object
    var targets = a;
    var obj = b;
    var trgr = c;
    var index = await this.getproperty(13, targets, 'indexval');
    if (index === '8') targets = await this.getproperty(8, targets, 'occupants');
    console.log('targets = ' + targets);
    if (targets === '') return;
    var effectprop = await this.getproperty(9, obj, "effects")//get string of effect indexes for object
    var effects = effectprop.split(',');
    effects = effects.filter(e => e != '');
    var targetarray = targets.split(',');
    for (var y = 0; y < targetarray.length; y++) {
    let target = targetarray[y];
      if (target === '') continue;
    for (var i = 0; i < effects.length; i++){//for each effect index pull the properties
    let effect = effects[i];
    var [changefunc, key, value, triggers, timerval] = await this.getval(11, effect, ["changefunc", "keys", "values", "triggers", "timerval"]);
    var n = triggers.indexOf(trgr);//check that trigger is good
    if (n === -1) continue;
    var reversal = await this.getproperty(4, changefunc, "replace");
    efn[reversal](key, target, value, obj);//create execution function
  }
   }
},
sumstring: async function(a){//takes stat value input, splits the string, and adds each value together. x is the total value, y is the original base stat.
    let string = a;//the string that requires chopping and adding
    var x = 0;
    return new Promise(resolve => {
      let stringsplit = string.split(',');
      var y = stringsplit[0];
      for (var i = 0; i < stringsplit.length; i++){
       x += +stringsplit[i];
      };
       resolve ([x,y]);
    })
},
hpres: async function (a, b, c){//takes target and the pending health change and resolves them
    var target = a;
    var cmd = b;
    var hpstring = c || '';
    console.log('target = ' + target + '; cmd = ' + cmd + '; hpstring = ' + hpstring);
    var [hp, maxhp, soak, atk, damages] = await this.getval(2, target, ['hp','maxhp','soak', 'atk', 'damages']);
  if (cmd === 'heal') {
      var newhp = +hp + +hpstring;
      if (+newhp > +maxhp) newhp = maxhp;
      return this.setval(2, target, ['hp'], [newhp]);
  };
    
    if (!damages && cmd!= 'cover') return;
    var damagevals = damages + hpstring;
    var damagearray = [];
  console.log('damagevals = ' + damagevals);
    var damagestrings = damagevals.split(',');
    damagestrings = damagestrings.filter(d => d != '');
    var len = damagestrings.length;
    
    for (var i = 0; i < len; i++){
        var damage = damagestrings[i];
        console.log('damage = ' + damage);
        if (damage === '') continue;
        var [attacker, attackroll, damagetotal] = damage.split(' | ');
        damagearray[i] = damagetotal + ',';
    };
    var [total, atkreplace] = await this.sumstring(atk);
    var damagearrayvals = damagearray.join(',');
    console.log(damagearrayvals);
    var [sumval, val1] = await this.sumstring(damagearrayvals);
    var dmg = (parseInt(sumval) - +soak)* -1;
    var newhp = +hp + +dmg;
    console.log('newhp = ' + newhp + '; old hp = ' + hp);
    this.setval(2, target, ['hp', 'atk', 'damages'], [newhp, atkreplace, '']);
    
},
cooldowntimer: async function(a, b){//checks cooldown for commands that are used in DM; applies to /investigate, /damage, 
   var cmd = a;
   var char = b;
   var cdval = 20;
    if (cmd === 'damage') cdval = 5;
   var cooldownpull = await this.getproperty(2, char, 'cooldowns');
   var newstamp = '2018-10-30T22:07:37.220Z';
   if (cooldownpull === ''|| cooldownpull === 'undefined') cooldownpull = cooldownpull + (cmd + '|' + newstamp + ',');
   console.log('Pull = ' + cooldownpull);
   return new Promise(resolve => {
   var p = cooldownpull.indexOf(cmd);
   var cooldowns = cooldownpull.split(',');
   for (var i = 0; i < cooldowns.length; i++){
   var timestamp;
   var cooldown = cooldowns[i];
   if (cooldown === '') continue;
   var m = cooldown.indexOf(cmd);
   if (m === -1) continue;
   var [commandgen,time] = cooldown.split('|');
   timestamp = new Date(time);
   var cooldownend = new Date(timestamp.getTime() + cdval*60000);
   var now = new Date();
    var q;
   if (now > cooldownend) {
     var cooldownstring = (cooldown+',');
     var cooldownreset = cooldownpull.replace(cooldownstring,'');
     var newcooldowns = (cooldownreset + cmd + '|' + now + ',');
     this.setval(2, char, ['cooldowns'], [newcooldowns]);
     q = 1;
     }else{q = 0};
     return resolve([q, cooldownend]);
    };
  })
},

querydoc: async function(a, b, c, d) {//queries the doc using provided index, query, search value, and key to return.
    var index = a;  
    var querykey = b;
    var searchval = c;
    var key = d;
    return new Promise(resolve => {
      doc.getRows(index, {'query': querykey + '= "' + searchval + '"'},function(err,row){
        if (!row[0]) return "none";
        var x = row[0][key];
        resolve (x);
    });
    })
},
eventsetup: async function(a){
var searchval = a;
var x = ['registration', '', '', '', '', '', '', '', '', '', '', ''];
var keys = ['state', 'label','title','starttime','gms','room','set','platform','blurb', 'meetup', 'announceroom', 'roles'];
return new Promise(resolve => {
  eventdoc.getRows(1,{'query':'label = "' + searchval + '"'},function(err,row){
    if (!row[0]) return console.log('An error has occurred in the process of pulling event data for setup. Function eventsetup terminated.');
    for (var i = 1; i < keys.length; i++){
      var key = keys[i];
      x[i] = row[0][key];
    };
    console.log('Event setup complete.');
    resolve (x);
  });

});
  
},
eventopencheck: async function(a){
  var searchval = a;
  var keys = ['label','title','starttime','gms','room','set','platform','blurb'];
  var x = 0;
  return new Promise(resolve =>{
    eventdoc.getRows(1,{'query':'label = "' + searchval + '"'},function(err,row){
      if (!row[0]){x = 'none'; console.log('An error has occurred in the process of pulling event data for setup. Function eventopencheck terminated.'); return resolve(x)};
      for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        if (key === '') continue;
        var y = 0;
        var val = row[0][key];
        if (val  === '') y = -1;
        x += y;
      };
      resolve (x);
  });
});
},
eventstartcheck: async function(a){
  var searchval = a;
  var keys = ['title', 'state','starttime','gms','room','set','platform','tointroduce','startmsg','endmsg','roundmessages','meetup'];
  var x = 0;
  return new Promise(resolve => {
    doc.getRows(7,{'query':'label = "' + searchval + '"'},function(err,row){
        if(!row[0]){x = 'none'; console.log('An error occurred in the process of running the start check for an event command. Function eventstartcheck terminated.');return resolve(x)};
        for (var i = 0; i < keys.length; i++){
          var key = keys[i];
          var y = 0;
          if (row[0][key] === '' || row[0][key] === 'TBD') y = -1;
          x += y;
        };
        resolve (x);
    });
  });
},
eventcreationclear: async function(a){
  var searchval = a;
  var keys = ['label',	'title',	'starttime',	'gms',	'room',	'set',	'platform',	'blurb', 'meetup', 'roles'];
  eventdoc.getRows(1, {'query':'label = "' + searchval + '"'},function(err,row){
      if (!row[0])return console.log('An error occurred in the process of removing event data for setup. Function eventcreationclear terminated.');
      for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        row[0][key] = '';
      };
      row[0].announceroom = '[503634158308818954]';
      row[0].save();
  });
},
roomquery: async function(a){
  var roomstring = a;
  return new Promise(resolve =>{
    doc.getRows(7,{'query':'room = ' + roomstring + '" and state = "active"'},function(err,row){
      var x = 1;
      if (!row[0]) x = 0
      resolve (x)
    });
  });
  
},
ingamemsgparser: async function(a, b){
var messagestring = a;
messagestring = messagestring.replace(/\r?\n|\r/g,' ').replace('  ', ' ');
var totalchars = messagestring.length;
var sentchars = 0;
var startchar = 0;
var endchar = 0;
var msgarray = [];
var msgnum = 0;
var numberfiller = ('');
var charlength = 0;
var maxchars = 486;
var msgindex = 0;
var preappend = b;

while (sentchars < totalchars ){
var maxend = startchar + maxchars;
var initialmsgstring = messagestring.substring(startchar, maxend);
var lastperiod = initialmsgstring.lastIndexOf(".");
var lastquestion = initialmsgstring.lastIndexOf("?");
var lastexclaim = initialmsgstring.lastIndexOf("!");
var lastquotes = initialmsgstring.lastIndexOf('"');
var endindex = Math.max(lastperiod,lastquestion,lastexclaim,lastquotes);
if (maxend >= totalchars) endindex = maxend;
endchar = +endindex + +startchar + 1;
var msgstring = messagestring.substring(+startchar, +endchar);
charlength = msgstring.length;
startchar = endchar + 1;
sentchars +=charlength + 1;
msgnum += 1;
numberfiller = (' [' + msgnum + '/#]');
var formattedstring = ('```' + preappend + msgstring + numberfiller + '```');
msgarray[msgindex] = formattedstring;
msgindex += 1;
if (sentchars > totalchars) break;
};
var msgcount = msgarray.length;
for (var i = 0; i < msgarray.length; i++){
  var segment = msgarray[i];
  var newsegment = segment.replace('#',msgcount);
  msgarray[i] = newsegment;
};
return new Promise(resolve =>{
  resolve (msgarray);
})

},
discordmsgparser: async function(a){
var firstarray = a;
var msgarray = [];
var arrayval = 0;
for (var i = 0; i < firstarray.length; i++){
  var messagestring = firstarray[i];
  if (messagestring === '') continue;
  var totalchars = messagestring.length;
  if (messagestring.length < 1994) {
    msgarray[arrayval] = ('```' + messagestring + '```');
    arrayval += 1;
    continue;
  };
  var startchar = 0;
  var maxchars = 1994;
  var endchar = 0;
  var sentchars = 0;
  var charlength = 0;
  while (sentchars < totalchars ){
    var maxend = startchar + maxchars;
    var initialmsgstring = messagestring.substring(startchar, maxend);
    var lastperiod = initialmsgstring.lastIndexOf(".");
    var lastquestion = initialmsgstring.lastIndexOf("?");
    var lastexclaim = initialmsgstring.lastIndexOf("!");
    var lastquotes = initialmsgstring.lastIndexOf('"');
    var endindex = Math.max(lastperiod,lastquestion,lastexclaim,lastquotes);
    if (maxend >= totalchars) endindex = maxend;
    endchar = +endindex + +startchar + 1;
    var msgstring = messagestring.substring(+startchar, +endchar);
    charlength = msgstring.length;
    startchar = endchar + 1;
    sentchars +=charlength + 1;
    var formattedstring = ('```' + msgstring + '```');
    msgarray[arrayval] = formattedstring;
    arrayval += 1;
    if (sentchars >= totalchars) break;
  };
  return new Promise(resolve =>{
    resolve (msgarray);
  })

};

},
npcattack: async function(a){
    var actionstring = a;
    var [searchval, action, target] = actionstring.split('|');
    var x;
    var targetarray = [];
    var msg = ('**#** launches an attack against **#** and rolls a **#**. When the round ends, # will need to roll defense!');
    //get attacker's roll data and set attack against target
    console.log('Executing NPC attack for ' + searchval + ' against ' + target);
    var targets = target.split(',');
    var tlen = targets.length;
    var maxindex = targets.length - 1;
    var [stat, attack, bonus, damage, attackername] = await this.getval(2, searchval, ['combatstat','atk','bonus', 'dmg', 'friendlyname']);
    attackername = attackername.charAt(0).toUpperCase() + attackername.slice(1);
    var modifier = await this.getproperty(2, searchval, stat);
    var [modtotal, newstat] = await this.sumstring(modifier);
    var [attacktotal, newatk] = await this.sumstring(attack);
    var [damagetotal, newdmg] = await this.sumstring(damage);
    var roll = Math.floor(Math.random() * 10) + 1;
    var total = +roll + +bonus + +modtotal + +attacktotal;
    if (total <= 1) this.doom(searchval);
    if (total < 4 ) return;
    var damageadd = await this.getproperty(4, total, 'dmgtarget');
    var fulldamage = +damagetotal + +damageadd;
    var attackerstring = (searchval + ' | ' + total + ' | ' + fulldamage + ',');
for (var i = 0; i < tlen; i++){
    var attacktarget = targets[i];
    var [pendingatks, targetname] = await this.getval(2, attacktarget, ['attacks', 'friendlyname']);
    var newstring = pendingatks + attackerstring;
    await this.setval(2, attacktarget, ['attacks'], [newstring]);
    targetarray[i] = targetname;
};
    
    await this.setval(2, searchval, [stat, 'atk', 'bonus', 'dmg'],[newstat, newatk, 0, newdmg]);
    return new Promise(resolve => {
        var targetstring;
        if (maxindex > 0) targetarray[maxindex] = ('and ' + targetarray[maxindex]);
        console.log(targetarray[maxindex]);
        if (tlen > 2) targetstring = targetarray.join(', ');
        if (tlen < 3) targetstring = targetarray.join(' ');
        msg = msg.replace('#', attackername).replace('#', targetstring).replace('#', total).replace('#', targetstring);
        var x = msg;
        resolve(x);
    })
},
npcanswer: async function(a){  
    var actionstring = a;
    var [searchval, actions, target] = actionstring.split('|');
    return new Promise(resolve => {
      resolve(target);
    });
    
},
npcdefense: async function(a){
    var actionstring = a;
    var [searchval, actions, target] = actionstring.split('|');
    var newdamages = [];
    var successarray = [];
    var success;
    var targets = [];
    var msgstring = ('[**#** defends against **#** attacks from **#** and succeeds **#** rolls!]');
    console.log('Executing NPC defense for ' + searchval);
    
    var [def, attacks, bonus, stat, actorname] = await this.getval(2, searchval, ['def', 'attacks', 'bonus', 'combatstat', 'friendlyname']);
    actorname = actorname.charAt(0).toUpperCase() + actorname.slice(1);
    var modifier = await this.getproperty(2, searchval, stat);
    var [deftotal, defreset] = await this.sumstring(def);
    var [stattotal, statreset] = await this.sumstring(modifier);
    var attackstring = attacks.split(',');
    attackstring = attackstring.filter(a => a != '');
    for (var i = 0; i < attackstring.length; i++){
          success = 0;
          var attack = attackstring[i];
          var [attacker, attackroll, damage] = attack.split(' | ');
          targets[i] = attacker;
          var roll = Math.floor(Math.random() *10) +1;
          var total = +roll + +bonus + +deftotal;
          if (+total >= +attackroll) {
            console.log('Adjusting attack string');
            attack = ''; 
            success = 1;
            };
          successarray[i] = success;
          console.log(successarray);
          newdamages[i] = attack;
    };
  targets = [...new Set(targets)];
  var len = targets.length;
  var max = targets.length - 1;
  if (len > 1) targets[max] = ('and ' + targets[max]);
  var attackerstring;
  if (len > 2) attackerstring = targets.join(', ');
  if (len < 3) attackerstring = targets.join(' ');
  var attacknum = successarray.length;
  successarray = successarray.join(',');
  var [sum, original] = await this.sumstring(successarray);
  if (attacknum === 1) msgstring.replace('attacks', 'attack');
  var damagestring = await this.getproperty(2, searchval, 'damages');
  msgstring = msgstring.replace('#', actorname).replace('#', attacknum).replace('#', attackerstring).replace('#', sum);
  newdamages = newdamages.filter(damage => damage != '');
  newdamages = newdamages.join(',');
  console.log('new damages = ' + newdamages + '; damages = ' + damagestring);
  var newdamagestring = (damagestring + newdamages);
  this.setval(2, searchval, ['attacks', 'damages', 'def', 'bonus'], ['', newdamagestring, defreset, 0]);
 return new Promise (resolve => {
     var x = msgstring;
      resolve (x);
  });
},
  
npccharge: async function(a){
    var actionstring = a;
    var [searchval, actions, target] = actionstring.split('|');
  console.log('Executing NPC charge for ' + searchval);
    var roll = Math.floor(Math.random() *10) + 1;
    var [chargeval, msg] = await this.getval(4, roll, ['chargeval', 'charge']);
    var [statval, actorname] = await this.getval(2, searchval, [target, 'friendlyname']);
    actorname = actorname.charAt(0).toUpperCase() + actorname.slice(1);
    var statname = await this.getproperty(4, target, 'replace');
    msg = msg.replace('#', actorname).replace('#', statname).replace('#', statname);
    var newstat = (statval + ',' + chargeval);
    this.setval(2, searchval, [target],[newstat]);
    return new Promise(resolve => {
        var x = msg;
        resolve(x);
    });
},
npcheal: async function(a){
    var actionstring = a;
    var [searchval, actions, target] = actionstring.split('|');
    var targets = target.split(',');
    targets = targets.filter(t => t != '');
    var len = targets.length;
    var maxindex = targets.length - 1;
    var targetsarray = [];
    
    var msg = ('**#** attempts to heal **#** and rolls a **#**. # restores # hp!');
  console.log('Executing NPC heal for ' + searchval);
    var [heal, actorname] = await this.getval(2, searchval, ['heal', 'friendlyname']);
    var roll = Math.floor(Math.random() *10) +1;
    var total = +roll + +heal;
    var healval = await this.getproperty(4, total, 'healeffect');
  for (var i = 0; i < len; i++){
    var actiontarget = targets[i];
    var targetname = await this.getproperty(2, actiontarget, 'friendlyname');
    this.hpres(actiontarget, 'heal', healval);
    targetsarray[i] = targetname;
  };
    var targetstring;
  if (len > 1) targetsarray[maxindex] = 'and ' + targetsarray[maxindex];
  if (len > 2) targetstring = targetsarray.join(', ');  
  if (len < 3) targetstring = targetsarray.join(' ');
    
    msg = msg.replace('#', actorname).replace('#', targetstring).replace('#', total).replace('#', actorname).replace('#', healval);
      return new Promise(resolve => {
        var x = msg;
        resolve(x);
    });
},
npccover: async function(a){
    var actionstring = a;
    var [name, actions, target] = actionstring.split('|');
    var msg;
    var roll = Math.floor(Math.random()*10) + 1;
    var cmdgen = "cover";
    var x;
  console.log('Executing NPC cover for ' + name);
    var attacks = await this.getproperty(2, target, "damages");//get pending damage strings
   var stringattacks = attacks.toString();
   if (!attacks) {return new Promise(resolve => {
     msg = (target + ' doesn\'t seem to have any pending attacks! Silly NPC.');
     x = msg;
     return resolve(x);
   })};
   var attackstring = attacks.split(',');//split attacker from damage
   var attack = attackstring[0];
   var attackreplace = (attack + ',');
   var newstring = attacks.replace(attackreplace, '');
   var [attacker, attackroll, damage] = attack.split(' | ');
   if (+roll < 3) {return new Promise(resolve => {
       msg = ('**'+name + '** attempted to cover **' + target + '** from **' + attacker.toString() + '** but wasn\'t quite fast enough!');
       x = msg;
       return resolve(x);
   })};
   this.setval(2, target, ['damages'],[newstring]);
   var [def, bonus, hp, soak, cover] = await this.getval(2, name, ['def','bonus','hp','soak', 'cover']);//get defense modifier
   var damagestring = (+damage - +soak);
   var [deftotal,defreset] = await this.sumstring(def);
   var [covertotal, coverreset] = await this.sumstring(cover);
   var defense = +roll + +bonus + +deftotal + +covertotal; //get the total defense roll
   var state = await this.getstate(defense, attackroll);//get state of (roll, 7)
   console.log(state);
   damage = +damage * -1;
   if (state === 1) damage = 0;
   var statestring = state.toString();
   var msg = await this.getproperty(4, statestring, 'cover');
   msg = msg.replace('#',name).replace('#', defense).replace('#',attacker).replace('#',attackroll).replace('#',target).replace('#',name).replace('#',damagestring);
   await this.hpres(name, cmdgen, attack);
   await this.setval(2, name, ['def', 'bonus','editlock','cover'],[defreset,0,0,coverreset]);//clear bonuses from defense
},
npcbuff: async function(a){//command flow: /event Label npcs buff Name Target...
    var actionstring = a;
    var [searchval, action, target] = actionstring.split('|');
    var targetarray = [];
    var msg = ('**#** attempts to buff **#** and rolls a **#**. # gets a boost of # to their #!');
  console.log('Executing NPC buff for ' + searchval);
    var buff = await this.getproperty(2, searchval, 'buff');
    var roll = Math.floor(Math.random() *10) +1;
    var total = +roll + +buff;
    var buffval = await this.getproperty(4, total, 'buffval');
    var [stat, ...targets] = target.split(',');
    targets = targets.filter(t => t != '');
    var len = targets.length;
    var [buff, actorname] = await this.getval(2, searchval, ['buff', 'friendlyname']);
    var statname = await this.getproperty(4, stat, 'replace');
for (var i = 0; i < len; i++){
      var actiontarget = targets[i];
      console.log(actiontarget);
      var [statstring, targetname ] = await this.getval(2, actiontarget, [stat, 'friendlyname']);
      var newstring = (statstring + ',' + buffval);
      this.setval(2, actiontarget, [stat], [newstring]);
      targetarray[i] = targetname;
    };
    var maxindex = len-1;
    var targetstring;
    if (len > 1) {targetarray[maxindex] = 'and ' + targetarray[maxindex]; msg = msg.replace('gets', 'get');};
    targetstring = targetarray.join(' ');
    if (len > 3) targetstring = targetarray.join(', ');  
    
    msg = msg.replace('#', actorname).replace('#', targetstring).replace('#', total).replace('#', targetstring).replace('#', buffval).replace('#', statname);
  
  return new Promise(resolve => {
    var x = msg;
    resolve(x);
  });
},
cleareventcd: async function (a, b){
    var searchval = a;
    var eventlabel = b;

    var eventstring = await this.getproperty(2, searchval, 'eventcooldown');
    if (eventstring = '') return;
    var events = eventstring.split(';');
    var len = events.length;
  for (var i = 0; i < len; i++){
    var event = events[i];
  console.log('event to clear = ' + event);
    var n = event.indexOf(eventlabel);
    if (n === -1) continue;
    event = event + ';';
    eventstring = eventstring.replace(event);
    if (!eventstring) eventstring = '';
  };
    this.setval(2, searchval, ['eventcooldown'], [eventstring]);
}, 
  
historicalwrite: async function (a, b){
    var keys = a;
    var values = b;
    var datestamp = new Date();
    eventdoc.getRows(6, {'query' : 'label = "open"'}, function(err, row){
      if (!row[0]) return;
      for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        var value = values[i];
        row[0][key] = value;
     }
        
     row[0].save();
        return;
    });
},
npcsetup: async function (a){
    var eventlabel = a;
    var npcstring = await this.getproperty(7, eventlabel, 'npcs');
      var timeoutstack = [];
    var npcs = npcstring.split(',');
    console.log('npcs = ' + npcs);
    npcs = npcs.filter(npc => npc != '');
    var len = npcs.length;
  for (var i = 0; i < len; i++){
   timeoutstack[i] = 1000 * i;
   doSetTimeout(i);
  }

    function doSetTimeout(i) {
      var npc = npcs[i];
      console.log('setting npc ' + npc);
  setTimeout(function() {
      eventdoc.getRows(2, {'query': 'label = "open"'}, function(err, row){
        if (!row[0]) return console.log('An error occurred pulling the row!');
          row[0].label = eventlabel;
          row[0].npclabel = npc;
          row[0].save();
      });}, timeoutstack[i]);
  

    };
},
npcactionclear: async function (a){
    var eventlabel = a;
var npcstring = await this.getproperty(7, eventlabel, 'npcs');
      var timeoutstack = [];
    var npcs = npcstring.split(',');
    console.log('npcs = ' + npcs);
    npcs = npcs.filter(npc => npc != '');
    var len = npcs.length;
  console.log('len = ' + len);
  console.log('Setting timeout functions');
  for (var i = 0; i < len; i++){
   timeoutstack[i] = 1000 * i;
   doSetTimeout(i);
  }

    function doSetTimeout(i) {
      var npc = npcs[i];
      console.log('setting npc ' + npc);
  setTimeout(function() {
      eventdoc.getRows(2, {'query': 'label = "' + eventlabel + '"'}, function(err, row){
        if (!row[0]) return console.log('An error occurred pulling the row!');
          row[i].act = '';
          row[i].acttargets = '';
          row[i].react = '';
          row[i].reacttargets = '';
          row[i].save();
      });}, timeoutstack[i]);
  

    };
},
npcactionpull: async function (a){
    var eventlabel = a;
    var actionarray = [];
    return new Promise(resolve =>{
      eventdoc.getRows(2, {'query': 'label = "' + eventlabel + '"'}, function(err, row){
        var len = row.length;
        for (var i = 0; i < len; i++){
            var npc = row[i].npclabel;
            var action = row[i].act;
            var targets = row[i].acttargets;
            var actionstring = (npc + '|' + action + '|' + targets);
            actionarray[i] = actionstring;
        };
        resolve (actionarray);
      });
    })
},
npcreactionpull: async function (a){
  var eventlabel = a;
  var actionarray = [];
  return new Promise(resolve =>{
    eventdoc.getRows(2, {'query': 'label = "' + eventlabel + '"'}, function(err, row){
      var len = row.length;
      for (var i = 0; i < len; i++){
          var npc = row[i].npclabel;
          var action = row[i].react;
          var targets = row[i].reacttargets;
          var actionstring = (npc + '|' + action + '|' + targets);
          actionarray[i] = actionstring;
      };
      resolve (actionarray);
    });
  })
},
eventcdcheck: async function (a, b){
      var searchval = a;
      var roomstring = b;
      
      var eventlabel = await this.querydoc(7, 'room', roomstring, 'label');
      var [actionpoints] = await this.getval(2, searchval, ['actionpoints']);
      
      return new Promise(resolve =>{
          var x = 0;
          var actions = actionpoints.split('|');
          actions = actions.filter(a => a != '');
          var actionslength = actions.length;
          var n = actionpoints.indexOf(eventlabel);
          if (n === -1) x = -1;
          for (var i = 0; i < actionslength; i++){
              var actionstring = actions[i];
              var m = actionstring.indexOf(eventlabel);
              if (m === -1) continue;
              var [label, points] = actionstring.split(';');
              points = parseInt(points);
              x = points;
          };
          resolve (x);
      });
},
setcooldown: async function(a, b, c){

  var searchval = a;//name
  var roomval = b;//roomstring
  var newpoints = parseInt(c);
  var eventlabel = await this.querydoc(7, 'room', roomval, 'label');

  var currentcd = await this.getproperty(2, searchval, 'actionpoints');
  var pointsstrings = currentcd.split('|');
  pointsstrings = pointsstrings.filter(p => p != '');
  var len = pointsstrings.length;
  var newcd = currentcd;
  for (var i = 0; i < len; i++){
      var cd = pointsstrings[i];
      var m = cd.indexOf(eventlabel);
      if (m ===-1) continue;
      var replacestring = (eventlabel + ';' + newpoints);
      newcd = currentcd.replace(cd, replacestring);
  };
  this.setval(2, searchval, ['actionpoints'], [newcd]);
},

investigationevent: async function(a, b, c, d){//runs the command check for investigations in an event, takes checkstring, eventlabel, investigation target, and check type as parameters. Returns a cooldownstring, an investigation action string, and an investigation number

    var checkstring = a;//complete eventcd string to check
    var labelval = b;//the event's label
    var targetval = c;

    var checktype = d;//checktypes: check, set; if check, resolves [x]; if set, resolves[checkstring, newstring];
    var returnval = [];
    var x = 1;//the value to add after investigate;

    var returnstring = (labelval + '|' + 'investigate,1' + '|' + targetval);
    var n = checkstring.indexOf(labelval);//index number of the check value to see if it exists in the string. If it does exist, remove old one from checkstring and return new checkstring + newstring

  return new Promise(resolve =>{
        if (n === -1){
          if (checktype === 'check') returnval = [x];
          if (checktype === 'set')  returnval = [checkstring, returnstring];
          return resolve(returnval);
        };
        var strings = checkstring.split(';').filter(string => string != '');
        var len = strings.length;
        for (var i = 0; i < len; i++){
          var string = strings[i];
          console.log('string = ' + string);
          var [event, commandnum, targets] = string.split('|');
          console.log('index = ' + targets.indexOf(targetval));
          var newtargets = targets;
          if (targets.indexOf(targetval) === -1) newtargets = targets + ',' + targetval;
          if (event != labelval) continue;
          var [command, num] = commandnum.split(',');
          num = parseInt(num);
          x = num + 1;
          returnstring = returnstring.replace('1', x).replace(targetval, newtargets);
          checkstring = checkstring.replace((string + ';'), '');
          if (checktype === 'check') returnval = [x];
          if (checktype === 'set')  returnval = [checkstring, returnstring];
          return resolve(returnval);
        }
        
    });
},
  
  npcstatuscheck: async function(a){
      var eventlabel = a;
      var npcstring = await this.getproperty(7, eventlabel, 'npcs');
      var npcs = npcstring.split(',');
      npcs = npcs.filter(x => x!='');
      var msgarray = []
      for (var i = 0; i < npcs.length; i++){
          var npc = npcs[i];
          var [hp, description, imgurl] = await this.getval(2, npc, ['hp', 'npcdeathmsg', 'npcdeathurl']);
          var msgreturn = ('[' + description + '|' + imgurl + '|]');
          if (+hp > 0) msgreturn = '';
          npc = npc + ',';
          if (hp <= 0) {npcstring = npcstring.replace(npc, '')}
          msgarray[i] = msgreturn;
      };
        msgarray = msgarray.filter(m => m != '');
        var msgstring = msgarray.join();
        this.setval(7, eventlabel, ['npcs'], [npcstring]);
        return new Promise(resolve => {resolve(msgstring)});
  },
  
  npcintroduce: async function(a){
      var eventlabel = a;
      var [npcstring, existing] = await this.getval(7, eventlabel, ['tointroduce', 'npcs']);
      var npcs = npcstring.split(',');
      npcs = npcs.filter(x => x!='');
      var msgarray = []
      for (var i = 0; i < npcs.length; i++){
          var npc = npcs[i];
          var [description, imgurl] = await this.getval(2, npc, ['npcdescription', 'npcimgurl']);
          description = ('[```' + description + '```{' + imgurl + '}]');
          msgarray[i] = description;
          
      };
    
    var newnpcs = (existing + npcstring);
    this.setval(7, eventlabel, ['npcs', 'tointroduce'], [newnpcs, '']);
    msgarray = msgarray.filter(m => m!='');
    var arraystring = msgarray.join();
    console.log('String to return for NPC Introductions: ' + arraystring);
    return new Promise(resolve =>{resolve(arraystring)});
  },
  npcboth: async function(a){
    var eventlabel = a;
    var msgarray = []
    var msgindex = 0;
      var [newnpcs, npcs] = await this.getval(7, eventlabel, ['tointroduce', 'npcs']);
      var npcstring = npcs.split(',');
      npcstring = npcstring.filter(x => x != '');
    if (npcstring != '' && npcstring != 'undefined'){
      for (var i = 0; i < npcstring.length; i++){
          var npc = npcstring[i];
          console.log(npc);
          var [hp, description, imgurl] = await this.getval(2, npc, ['hp', 'npcdeathmsg', 'npcdeathurl']);
          var msgreturn = ('[' + description + '{' + imgurl + '}]');
          if (+hp > 0) msgreturn = '';
          npc = npc + ',';
          if (hp <= 0) {npcs = npcs.replace(npc, '')}
          msgarray[msgindex] = msgreturn;
          msgindex = +msgindex + 1;
      };
    };
      if (newnpcs != '' && newnpcs != 'undefined'){
      var introducing = newnpcs.split(',');
      introducing = introducing.filter(x => x != '');
      for (var i = 0; i < introducing.length; i++){
          var newnpc = introducing[i];
          console.log(newnpc);
          var [description, imgurl] = await this.getval(2, newnpc, ['npcdescription', 'npcimgurl']);
          description = ('[```' + description + '```{' + imgurl + '}]');
          msgarray[msgindex] = description;
          msgindex = +msgindex + 1;
          npcs = (npcs + npc + ',');
      };
      };
    msgarray = msgarray.filter(m => m!='');
    var msgstring = msgarray.join();
    var npcreplace = npcs;
        return new Promise(resolve => {resolve([msgstring, npcreplace])});
  },
  eventres: async function (a, b){//takes target and the pending health change and resolves them
    var target = a;
    var eventlabel = b;
    var [hp, maxhp, soak, atk, damages, actionpoints] = await this.getval(2, target, ['hp','maxhp','soak', 'atk', 'damages', 'actionpoints']);
    var damagearray = [];
  console.log('damages = ' + damages);
    var newhp = hp;
    var atkreplace = atk;
    if (damages != ''){
    var damagestrings = damages.split(',');
    damagestrings = damagestrings.filter(d => d != '');
    var len = damagestrings.length;
    for (var i = 0; i < len; i++){
        var damage = damagestrings[i];
        console.log('damage = ' + damage);
        if (damage === '') continue;
        var [attacker, attackroll, damagetotal] = damage.split(' | ');
        damagearray[i] = damagetotal + ',';
    };
    var [total, newattack] = await this.sumstring(atk);
    atkreplace = newattack;
    var damagearrayvals = damagearray.join(',');
    console.log(damagearrayvals);
    var [sumval, val1] = await this.sumstring(damagearrayvals);
    var dmg = (parseInt(sumval) - +soak)* -1;
    newhp = +hp + +dmg;
    console.log('newhp = ' + newhp + '; old hp = ' + hp);
    };
    var apn = actionpoints.indexOf(eventlabel);
    if (apn === -1) actionpoints = (actionpoints + eventlabel + ';' + 0 + '|');
    var pointsarray = actionpoints.split('|');
    pointsarray = pointsarray.filter(apr => apr != '');
    var pointslength = pointsarray.length;
    var actionpointsstring = actionpoints;
  for (var ap = 0; ap < pointslength; ap ++){
      var actionpointlog = pointsarray[ap];
      var e = actionpointlog.indexOf(eventlabel);
      if (e === -1) continue;
      var pointsreset = (eventlabel + ';' + 10);
      actionpointsstring = actionpointsstring.replace(actionpointlog, pointsreset);
  };
    this.setval(2, target, ['hp', 'atk', 'damages', 'actionpoints'], [newhp, atkreplace, '', actionpointsstring]);
    
},
  
errorhandler: async function(a){
    
},
  
}