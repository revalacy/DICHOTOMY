const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, target, ...objname]) => {
  
   
  if (!name) return message.channel.send('You must include the character name in your command!');
  var object = objname.join(" ").trim().toLowerCase(); //command string: /send Name Target Objectstring
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting Send'); 
var cmdgen = ("use");
var objectstring = (object + ",")
var namestring = ('**' + name + '**');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  console.log('Owner verified, starting data collection for command');
  
  //declare all variables up front, fill them later. Make sure each is differentiated with programmer's notes
  
  
  var inventory = await fn.getproperty(2, name, 'inventory');//pull user's inventory string, check that object is in inventory
  if (target === 'self') target = name;
  await fn.effectexecute(target, object, cmdgen);//pull object's effects, run effects string
  if (target === name) target = 'themselves';
  var usestring = await fn.getproperty(9,object,'usemsg');
  var msg = (namestring + ' used the ' + object + ' on ' + target + '! ' + usestring);//send use message
  message.channel.send(msg);
  }


  
  resolve();
}