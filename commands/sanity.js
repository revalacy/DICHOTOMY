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

exports.run = (client, message, args) => {
    

  let name = args[0]; //command comes in, argument is Name
  var user = message.author.id;//get the user's ID
   if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  var roll = Math.floor(Math.random() *10)+1;//create the roll variable
  var namestring = ('**'+name+'** ');
  
async function resolve(){
          var owner = await fn.getproperty(2, name, 'userid');//get the owner's ID
          if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
          if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//ownership check, respond if fails and exit function

          let minimum = await fn.getval(1, name, ["min"]); //get the minimum threshold for the character
          var state = await fn.getstate(roll, minimum);//create state variable
          var string1 = await fn.getval(4, roll, ["replace"]);//get string for roll
          var string2= await fn.getval(4, state, ["sanity"]);//get string for outcome
          message.channel.send(namestring + string1 + string2);//send response strings
          if (state === "0") await fn.addmadness(name, 1, "sanity");//if state = 0 add madness entry
          if (state === "0") getstage();
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