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

exports.run = (client, message, [name, target, ...objname]) => {
  
   
  if (!name) return message.channel.send('You must include the character name in your command!');
  var object = objname.join(" ").trim().toLowerCase(); //command string: /send Name Target Objectstring
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting Send'); 
var cmdgen = ("send");
var objectstring = (object + ",")
var namestring = ('**' + name + '**');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  console.log('Owner verified, starting data collection for command');
  
  //declare all variables up front, fill them later. Make sure each is differentiated with programmer's notes
  
  var sender = name; //the string indicating where the object was sent from. This will always start out as name
  var recipient = target; //the string indicating where the object was sent to. This will always start as the target
  var oldindex = 2; //the index of the location the object is being sent FROM. This will always start as 2
  var newindex; //the index of the location the object is being sent TO. This will start undefined.
  var stringaddress; //the string used for sending a message to the recipient of the object if one exists. This will start undefined
  var recipid; //the discord user ID for the person receiving the object. This will start undefined
  var state; //the state of whether or not the recipient will know immediately that an item arrived. 1 means recipient knows, 0 means the object was sent in secret
  
  
  console.log('Starting object property pull.');
  //pull all properties for the object that will be needed for the command. Requires type, description, objectowner, movealert, location, remaining, hideval, effects
  var [type, description, objectowner, movealert, objectlocation, remaining, hideval, effects, hasmsg] = await fn.getval(9, object, ['type','description','objectowner','movealert','location','remaining','hideval','effects','hasmsg']);
  //pull all properties for the sender. Requires friendlyname, userid, home, inventory
  console.log('Starting sender property pull.');
  var [sendername, senderid, senderloc, senderinventory] = await fn.getval(2, sender,['friendlyname','userid','location','inventory']);
  //run object-sender proximity check. if object's location isn't sender or senderlocation, return
  if (objectlocation != sender && objectlocation != senderloc) return message.channel.send('You must be near an object to send it!');
  //pull recipient's index
  newindex = await fn.getproperty(13, recipient, 'indexval');
  console.log('Starting recipient property pull. Current index: ' + newindex);
    //pull all properties for the recipient. Requires friendlyname, userid, home, location, inventory, packagerule
  var [recipname, recipowner, reciphome, recipinventory, packagerule] = await fn.getval(newindex, recipient, ['friendlyname', 'userid', 'home', 'inventory', 'acceptspackages']);
  //if object type is setting, change recipient to home; change recipient inventory to location inventory; change newindex to 8; change sender to sender's location; change oldindex to 8;
  console.log('Starting setting type data modification. Recipient: ' + recipient);
  
  if (type === "setting"){
    console.log('Modifying sender data, object type = setting');
    recipient = reciphome;
    recipinventory = await fn.getproperty(8, recipient, 'inventory');
    recipname = await fn.getproperty(8, recipient, 'friendlyname');
    newindex = 8;
    sender = senderloc;
    senderinventory = await fn.getproperty(8, sender, 'inventory');
    oldindex = 8;
  };
  
  if (objectlocation === senderloc) {
      sender = senderloc;
      senderinventory = await fn.getproperty(8, sender, 'inventory');
      oldindex = 8;
      };
  
    //if recipient is "blank", or packagerule is no, return 'can't send object to person, too large for inventory and no home address identified, please contact them directly or send to a facility'
  if (recipient === 'blank' || packagerule === 'no') return message.channel.send('Unable to send item, it is too large for a player\'s inventory and ' + target + ' has no home set.');
  //all checks passed. Remove object from sender's inventory, run effects clear if effects exist.
  console.log('All checks passed, proceeding to clear effects from sender.');
  var newsenderinventory = senderinventory.replace(objectstring, '');
  await fn.setval(oldindex, sender, ['inventory'],[newsenderinventory]);
  await fn.effectreverse(sender, object, cmdgen);
  console.log('Object removed from sender\'s inventory.');
  
  await fn.setval(9, object, ['location'],[recipient]);
  //Add object to recipient's inventory, run effects function if effects exist
  var newrecipinventory = (recipinventory + objectstring);
              console.log(newrecipinventory + ' ' + newindex);
  await fn.setval(newindex, recipient, ['inventory'], [newrecipinventory]);
  await fn.effectexecute(recipient, object, cmdgen);
              console.log('Object added to recipient\'s inventory.');
  //get the state - threshold is hideval, pull perception, add to roll and return state of 0 or 1
  var targetindex = await fn.getproperty(13, target, 'indexval')
  if(targetindex === '2'){
          var recipientper = await fn.getproperty(newindex, target, 'per');
          var roll = Math.floor(Math.random()*10)+1;
          var invstring = 'your inventory.';
          if (newindex === '8') invstring = recipient + '.';
          //build alert message to recipient - set stringaddress to target, add recipient's friendly name if index is 8
            console.log('Building message.');
          stringaddress = target;
          if (newindex === '8') stringaddress = (recipname + ', addressed to ' + target);
          var rolltotal = +roll + +recipientper;
            state = fn.getstate(rolltotal,hideval);
          if (hideval === '0') state = 1;
          if (hasmsg === '0') state = 0;
          var statesearch = state.toString();
          var msg = (name + ' sent a package to ' + stringaddress + '. You can find it in ' + invstring);
          var newhome = client.users.get(recipid);
            if (state === '1') newhome.send(msg);
          console.log('Message sent.');
  }
  //
message.channel.send('Item has been sent to ' + recipname);
  var ownerid = client.users.get(objectowner);
if (movealert === '1') ownerid.send(object + ' has been sent to ' + target + ' by ' + name + '.');
  console.log('Send complete.');
}


  
  resolve();
}