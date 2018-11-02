const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc1 = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const doc2 = new GoogleSpreadsheet('16bWQdKPv4elUPb8UKqD3NP-Ve5TwHGjQWBdAhbkOBLI');//objects and sets database
    const doc3 = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc1.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc2.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc3.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});

var fn = require ('./../functions.js');

//command flow: name, stat, target
exports.run = (client, message, [name, location]) => {
  
 if (!name) return message.channel.send('You must include the character name in your command!');
  //Arguments: Name, Target, Object

async function resolve(){
console.log('Starting location movement.'); 
var cmdgen = ("move");
var namestring = ('**' + name + '**');
  var namelist = (name + ',');
var user = message.author.id;
var owner = await fn.getproperty(2, name, 'userid');
if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions. If you believe this message is in error, please contact a GM.');
if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//ownership checks
    
    console.log('Collecting object properties.');
    //pull name's properties: inventory, location
  var [inventory, currentlocation] = await fn.getval(2, name, ['inventory','location']);
    //pull location's properties: inventory, occupants, haslock, authorizedentry, knocking, description, friendlyname, activestate
  var [locationinventory, occupants, haslock, authorizedentry, knocking, description, friendlyname, activestate, locationhome] = await fn.getval(8,location, ['inventory','occupants','haslock','authorizedentry','knocking','description','friendlyname','activestate','location']);
    //if activestate is inactive return 'this location isn't currently active, please reach out to a GM if you have questions'
  
  console.log('Running access checks.');
  if (activestate === 'inactive') return message.channel.send('This location is not currently active. Please reach out to a GM if you have questions.');
    //check haslock - if there is a lock and name doesn't have key item, check authorized entry, if they aren't listed return 'you don't have a key to this location, you'll need to knock on the door', if they are listed remove them from authorized entry
  var msg = (namestring + ' has entered ' + friendlyname + '.');
  console.log('');
  if (haslock === 'yes'){
      var key = await fn.getproperty(8, location, 'lockitem');
      var n = inventory.indexOf(key);
      if (n === -1){
            var q = authorizedentry.indexOf(name);
            if (q === -1) {
                    var [newlocname,newlococcupants,newlocinventory] = await fn.getval(8, locationhome, ['friendlyname','occupants','inventory']);
                    locationinventory = newlocinventory;
                    occupants = newlococcupants;
                    location = locationhome;
                    friendlyname = newlocname;
                    msg = (namestring + ' does not have the key required to enter this location. Either you must find a key, or you will need to knock and hope the owner opens the door. ' + namestring + ' has entered ' + locationhome + ' instead.');
          
        };
      };
  };
  console.log('Access checks complete. Modifying occupants list.');
    //add name to occupants list
    var newoccupants = (occupants + namelist);
    fn.setval(8,location,['occupants'],[newoccupants]);
    //change name's location
    fn.setval(2, name, ['location'],[location]);
    //if currentlocation isn't 'blank' run effect reverse on currentlocation's inventory
  if (currentlocation != 'blank') {
        var [oldinventory,oldoccupants] = await fn.getval(8, currentlocation, ['inventory','occupants']);
        var replacementoccupants = oldoccupants.replace(namelist, '');
        fn.setval(8,currentlocation, ['occupants'],[replacementoccupants]);
        var objects = oldinventory.split(',');
        for (var i = 0; i < objects.length; i++){
              var object = objects[i];
              if (object === '') continue;
              await fn.effectreverse(name, object, cmdgen);
    };
  };
    //run effectexecute on location's inventory targeting name
  var newobjects = locationinventory.split(',');
  console.log('objects for checking = ' + newobjects);
  for (var i2 = 0; i2 < newobjects.length; i2++){
          var newobject = newobjects[i2];
          if (newobject === '') continue;
          await fn.effectexecute(name, newobject,cmdgen);
  };
   message.channel.send(msg); //return msg
  console.log('Location entry complete. Message sent.');
 }
 
  resolve();
}