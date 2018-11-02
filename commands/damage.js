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

exports.run = (client, message, [name, ...objectvals]) => {
  
var object = objectvals.join(' ');
  //Arguments: Name, Object

async function resolve(){
        //check roles for user, if GM then proceed, if not then return
var objuser = name;
var cmdgen = ("damage");
var objectstring = (object + ",")
var user = message.author.id;
var state;
var inventorykey = ('inventory');
var index = 2;
var namestring = ('**'+name+'**');
var announcementroom = client.channels.get('503634158308818954');
  
  var [type, objecthpmax, objecthp, hardness, objectowner, movealert, objectlocation, effects] = await fn.getval(9, object, ['type','maxhp','hp','hardness','objectowner','movealert','location','effects']);//get all object properties needed: type, maxhp, hp, hardness, objectowner, movealert, location, effects
  
  console.log(objuser);
  var [combatstat, userlocation, userinventory, atk, dmg, cooldowns] = await fn.getval(2, objuser, ['combatstat', 'location','inventory','atk','dmg','cooldowns']);//get user's properties: combatstat, location, inventory, atk, dmg
  var stat = await fn.getproperty(2, objuser, combatstat);
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
var room = message.channel.id;
  };
if (roomtype === 'text'){
  var roomused = message.channel.id;
  var f = await fn.eventproperty(roomused, 'registered');
  if (f === 'none'|| f === '') return message.channel.send('There is not an active event in this room! If you\'d like to register for an active or pending event, please head to ' + announcementroom + ' to get details.');
  z = await fn.eventcdcheck(name, roomused);
  blockmsg = blockedmsg2;
};
  if (z === 0) return message.channel.send(blockmsg);
  if (type === 'setting' && objectlocation != userlocation) return message.channel.send('You must be near an object to do anything to it!')//if type is setting and object/user locations don't match return message
  if (type === 'setting') {//if type is setting and if object location and person location is the same, replace inventory with location's inventory and change inventorykey to setting
    objuser = userlocation;
    index = 8;
    userinventory = await fn.getproperty(index, objuser, 'inventory');
  };
  var roll = Math.floor(Math.random()*10) +1;//collect roll value and modifiers, compare to hardness
  var [attacktotal,newatk] = await fn.sumstring(atk);
  var [damagetotal,newdmg] = await fn.sumstring(dmg);
  var rolltotal = +roll + +attacktotal + +stat;
  console.log(rolltotal);
  var damage = 0;
  var state = 0;
  var statestring = ('a **failure**. No damage has been done to ' + object + '.');
  if (+rolltotal > +hardness) {
    damage = -1;//if roll > hardness, -1 to object hp
    statestring = ('a **success**! 1 point of damage has been dealt to ' + object + '.');
    state = 1;
  };
  console.log(state);
  var newhp = +objecthp + +damage;
  fn.setval(9,object,['hp'],[newhp]);
  if (state === 1) fn.effectexecute(objuser, object, cmdgen);//execute effects
  message.channel.send(name + ' attempted to damage ' + object + '. The attempt was '+ statestring);
  if (roomtype === 'text'){
    var hasactedstring = await fn.eventproperty(room,'hasacted');
   var newstring = (hasactedstring + name +',');
   fn.eventmodifyval(room,['hasacted'],[newstring]);
  };
}
  
  resolve();
  
}