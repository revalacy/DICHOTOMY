const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, ...objname]) => {
  
   
  if (!name) return message.channel.send('You must include the character name in your command!');
  var object = objname.join(" ").trim().toLowerCase(); //command string: /send Name Target Objectstring
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting Send'); 
var cmdgen = ("discard");
var objectstring = (object + ",")
var namestring = ('**' + name + '**');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  console.log('Owner verified, starting data collection for command');
  
  //declare all variables up front, fill them later. Make sure each is differentiated with programmer's notes
  var objectlocation = await fn.getproperty(9, object, 'location');
  if (objectlocation != name) return message.channel.send(namestring + ' doesn\'t have that object to discard!');
  //get player's inventory string, location
  var [inventory, location] = await fn.getval(2, name, ['inventory','location']);
  //get location's inventory string
  var locationinventory = await fn.getproperty(8,location, 'inventory');
  //remove object from player inventory
  var newinventory = inventory.replace(objectstring,'');
  var replaceinventory = (locationinventory + objectstring);
  await fn.setval(2, name, ['inventory'],[newinventory]);
  await fn.setval(8, location, ['inventory'],[replaceinventory]);
  var msg = (namestring + ' has discarded ' + object + '.');//send message
  await fn.effectreverse(name, object, cmdgen);
   message.channel.send(msg);
  await fn.effectexecute(location, object, cmdgen);
  
  }


  
  resolve();
}