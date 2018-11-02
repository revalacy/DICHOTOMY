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
var recipient = name;
var cmdgen = ("give");
var objectstring = (object + ",")
var user = message.author.id;
var state;
  
if(!message.member.roles.find("name","GM")) return message.channel.send('You must be a GM to use that command. Please contact an admin if you believe this message was sent in error.');
//get all necessary object properties

var [description, activestate, objectowner, oldlocation, canmove, hideval, effects, editlock, remaining, movealert, type, hasmsg] = await fn.getval(9, object, ['description','activestate','objectowner','location', 'canmove','hideval','effects', 'editlock','remaining','movealert', 'type','hasmsg']);
  
var newindex = await fn.getproperty(13, recipient, 'indexval');//get the index of the new home object
  
if (type === 'setting' && newindex === '2') recipient = await fn.getproperty(2, recipient, 'home');
  
if (recipient === 'blank') return message.channel.send('That object is too large to fit into an inventory and ' + name + 'doesn\'t have a home on record. Please contact ' + name + ' to determine where the object should be sent.');
  
var [inventorypull, id] = await fn.getval(+newindex, recipient, ['inventory', 'userid']);//get all necessary new home properties
  
  console.log(inventorypull);

if (remaining === '0') return message.channel.send ('There are no more of this item to hand out. Please use /move for objects that already have homes.');

var newinventory = (inventorypull + objectstring);//create the new inventory string for the new home
  
fn.setval(newindex, recipient, ['inventory'], [newinventory]);//set object to new home

var newloc = (oldlocation + ',' + recipient);
  
if (oldlocation === 'blank') newloc = recipient;
  
fn.setval(9, object, ['location','remaining'],[newloc,+remaining-1]);
  console.log('newindex = ' + newindex);
  
 if (effects != '0') fn.effectexecute(name, object, cmdgen); //to execute effects, 

message.channel.send ('Done!');
  
  if(newindex === '2'){
          var recipientper = await fn.getproperty(newindex, recipient, 'per');
          var roll = Math.floor(Math.random()*10)+1;
          var invstring = 'your inventory.';
          var msg = (recipient + ' has received a new item!' + description + 'You can find it in ' + invstring);
          var rolltotal = +roll + +recipientper;
            state = fn.getstate(rolltotal,hideval);
          if (hideval === '0') state = 1;
          if (hasmsg = '0') state = 0;
          var recipientid = client.users.get(id);//get the userID of the recipient of the object
            if (state === 1) recipientid.send(msg);
          console.log('Message sent.');
  }
var ownerid = client.users.get(objectowner);
if (movealert === '1') ownerid.send('The object ' + object + ' has been sent to ' + name + ' through a GM command.') 
  }
  
  resolve();
}