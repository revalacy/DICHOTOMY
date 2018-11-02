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

var fn = require ('./../functions.js');
var efn = require ('./../functions.js');

exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    var user = message.author.id;//gets user ID for command author
    var namestring = ('**'+name+'** ');

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 //Get current stage, points, and min to compare
 async function resolve(){
   var owner = await fn.getproperty(2, name, 'userid'); 
   if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
   var [first, last, stage, hp, wp, inventorystring, location, doom, maxhp, maxwp] = await fn.getval(2, name, ['firstname','lastname', 'stage','hp','wp','inventory','location', 'doom','permhp','wpmax']);//get all variables necessary to show stats from sheet 2 (firstname, lastname, stage, hp, wp, inventory, location, doom)
   var madtotal = await fn.getproperty(1, name, 'madtotal');//get madtotal from sheet 1
   
  var invarray = inventorystring.split(',');//split string for inventory
  
  for (var i = 0; i < invarray.length; i++){//pull hidden property for each object in the inventory, filter array to hidden === 0, join array
     var item = invarray[i];
     if (!item) continue;
     var hideprop = await fn.getproperty(9,item,'ishidden');
     if (hideprop === "1") inventorystring.replace(item, '');
  }
   var inventorysplit = inventorystring.replace(/,\s*$/, "");
   var inventory = inventorysplit.split(',');
   var inventoryfix = '';
   for (var i = 0; i < inventory.length; i++) {
    var a = inventory[i];
    inventoryfix += a.charAt(0).toUpperCase() + a.substr(1) + ('; ');
   };
   inventory = inventoryfix.replace(/;\s*$/, "");
   var fullname = (first + ' ' + last);
   if (!inventory) inventory = ('Empty.');
   if (location === 'blank') location = ('N/A');
   var msg = ('Here are your current character stats:\n\n**Name:** ' + fullname + '\n**Health:** ' + hp + '/' + maxhp + '\n**Willpower:** ' + wp + '/' + maxwp + '\n**Doom points:** ' + doom + '\n**Madness points:** ' + madtotal + '\n**Madness Stage:** ' + stage + '\n**Location:** ' + location + '\n**Inventory:** ' + inventory);
  //compile message response
   
  message.author.send(msg);

 }
  


  
resolve();

}