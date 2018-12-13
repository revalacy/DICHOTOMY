const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, ...objname]) => {
  
   
  if (!name) return message.channel.send('You must include the character name in your command!');
  var object = objname.join(" ").trim().toLowerCase(); //command string: /send Name Target Objectstring
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting Take'); 
var cmdgen = ("take");
var objectstring = (object + ",")
var namestring = ('**' + name + '**');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  console.log('Owner verified, starting data collection for command');
  
  //declare all variables up front, fill them later. Make sure each is differentiated with programmer's notes
  
  //get player's inventory string, location
  var [inventory, location] = await fn.getval(2, name, ['inventory','location']);
  //get location's inventory string
  var objectlocation = await fn.getproperty(9, object, 'location');
  var [locationinventory, friendlyname] = await fn.getproperty(8, location, ['inventory','friendlyname']);
  //check location inventory for object, if present replace object in string with ''
  if (objectlocation != location) return message.channel.send('You must be near an item in order to take it. Objects cannot be taken from other players through commands. If you wish to obtain an item from another character, have the object delivered through /send after the appropriate plot details have been determined.');
  //add object to player's inventory
  var newinventory = (inventory + objectstring);
  var replaceinventory = locationinventory.replace(objectstring, '');
  await fn.setval(2, name, ['inventory'],[newinventory]);
  await fn.setval(8, location, ['inventory'],[replaceinventory]);
  await fn.setval(9, object, ['location'],[name]);
  var msg = (namestring + ' has taken ' + object + ' from ' + friendlyname + '. It can now be found in your inventory.');//send message
  message.channel.send(msg);
  fn.effectsexecute(name, object, cmdgen);
  }


  
  resolve();
}