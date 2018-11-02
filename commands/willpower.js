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

//Command flow: /roll Name stat (optional)bonus
exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    let spec = args[1]||"standard";
    var user = message.author.id;//gets user ID for command author
    var dateObj = new Date();
          var month = dateObj.getUTCMonth() + 1; //months from 1-12
          var day = dateObj.getUTCDate();
          var year = dateObj.getUTCFullYear();

          let newdate = month + "/" + day + "/" + year;
  var namestring = ('**'+name+'** ');

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var owner = await fn.getproperty(2, name, 'userid'); //pull owner's id
   if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//if id's match, execute codeblock
     var will = await fn.getproperty(2, name,'willpower');//get current willpower
     var newwp = +will - 1;
     await fn.setval(2, name, newwp,['wp'])
     var option1 = (namestring+'has chosen to spend 1 point of Willpower to overcome a mental obstacle.');//check for "standard" variable, if missing use option 2
     var option2 = (namestring+'has chosen to spend 1 point of Willpower to negate a point of Madness.');
    if (spec === "standard")message.channel.send(option1);
    if (spec === 'madness'){
      fn.addmadness(name,-1,"willpower");//adds Name, Date, Type and Command to Discord feed to reduce Madness
     message.channel.send(option2)
 }
 }
    
  
 
  resolve();
}