const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, ...objectvals]) => {
  
var object = objectvals.join(' ');
  //Arguments: Name, Object

async function resolve(){
        //check roles for user, if GM then proceed, if not then return
var recipient = name;
var cmdgen = ("give");
var objectstring = (object + ",")
var user = message.author.id;
var state;
var inventorykey = 'inventory';
  
if(!message.member.roles.find(x => x.name === "GM")) return message.channel.send('You must be a GM to use that command. Please contact an admin if you believe this message was sent in error.');
//get all necessary object properties

var [description, activestate, objectowner, oldlocation, canmove, hideval, effects, editlock, remaining, movealert, type, hasmsg, objectname] = await fn.getval(9, object, ['description','activestate','objectowner','location', 'canmove','hideval','effects', 'editlock','remaining','movealert', 'type','hasmsg', 'friendlyname']);
  
var newindex = await fn.getproperty(13, recipient, 'indexval');//get the index of the new home object
  
if (type === 'setting' && newindex === '2') recipient = await fn.getproperty(2, recipient, 'home');
  
if (type === 'key' && newindex === '2') inventorykey = 'keys';
  
if (recipient === 'blank') return message.channel.send('That object is too large to fit into an inventory and ' + name + 'doesn\'t have a home on record. Please contact ' + name + ' to determine where the object should be sent.');
  
var [inventorypull, id, cluepull] = await fn.getval(+newindex, recipient, [inventorykey, 'userid', 'hasclues']);//get all necessary new home properties
  
  console.log(inventorypull);

var newclues = cluepull + objectstring;

if (remaining === '0') return message.channel.send ('There are no more of this item to hand out. Please use /move for objects that already have homes.');

var newinventory = (inventorypull + objectstring);//create the new inventory string for the new home
  
fn.setval(newindex, recipient, [inventorykey], [newinventory]);//set object to new home

var newloc = (oldlocation + ',' + recipient);
  
if (oldlocation === 'blank') newloc = recipient;
  
await fn.setval(9, object, ['location','remaining'],[newloc,+remaining-1]);
  console.log('newindex = ' + newindex);
  
 if (effects != '0') fn.effectexecute(name, object, cmdgen); //to execute effects

message.channel.send ('Done!');
  
  if(newindex === '2'){
          var recipientper = await fn.getproperty(newindex, recipient, 'per');
          var roll = Math.floor(Math.random()*10)+1;
          var invstring = 'your inventory.';
          var msg = (recipient + ' has received a new item! It\'s ' + objectname + '. ' + description + ' You can find it in ' + invstring);
          var rolltotal = +roll + +recipientper;
            state = fn.getstate(rolltotal,hideval);
          if (hideval === '0') state = 1;
          if (hasmsg === '0') state = 0;
          var recipientid = client.users.get(id);//get the userID of the recipient of the object
            if (state === 1) recipientid.send(msg);
          console.log('Message sent.');
  };
if (+hideval > 0) await fn.setval(newindex, recipient, ['hasclues'], [newclues]);
var ownerid = client.users.get(objectowner);
if (movealert === '1') ownerid.send('The object ' + object + ' has been sent to ' + name + ' through a GM command.') 
  }
  
  resolve();
}