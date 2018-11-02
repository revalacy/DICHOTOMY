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

exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    var user = message.author.id;//gets user ID for command author
    var namestring = ('**'+name+'** ');

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 //Get current stage, points, and min to compare
 async function resolve(){
   var owner = await fn.getproperty(2, name, 'userid'); 
   if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
  var msg = (namestring+'has chosen to take 1 point of Madness passively for today.');
    message.channel.send(msg);
    await fn.addmadness(name,"sanity","passive");//adds Name, Date, Type and Command to Discord feed;
    getstage();
         

      
    }
  async function getstage(){
          var points = await fn.getproperty(1, name, 'madtotal');//get current points, stage and new stage
          var stage = await fn.getproperty(2, name, 'stage');
          var newstage = +stage + +1;
          var newpoints = +points + 1;
          var min = await fn.getval(4, newstage, ["minpoints"]); //get min for new stage

          if (+newpoints >= +min) return fn.setval(2, name , ['stage'],[newstage]);//if points are high enough set new value to stage
           }
  
  
  resolve();
}