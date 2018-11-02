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
    
  let name = args[0];//Get character name
  let namestring = ("**" + name + "**");
  let user = message.author.id;//Get the user's ID for later ownership check.
  var dateObj = new Date(); 
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  let newdate = month + "/" + day + "/" + year;
  var rolls = [];
  var results = [];
  var points = [];
  
  async function resolve(){
    var owner = await fn.getproperty(2, name, 'userid');//get the owner's ID
    if (!owner) return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//ownership check, respond if fails and exit function
    const [minpull,minpullplus] = await fn.getval(2, name, ["exposureobject","exposurelocation"]);//get all exposure minimums in variable
    if (!minpull) return message.channel.send('You don\'t have any exposure to roll against!'); //if no exposure exit function
    var min = minpull.match(/\d+/g);
    var len = min.length;//get number of rolls for exposure to determine the variable used
    for (var i = 0; i < len; i++){
      min[i] = +min[i];//convert min array to numbers instead of strings
      rolls[i] = Math.floor(Math.random() *10)+1; //make a roll for each exposure value in the array
      };
     await compare(min, rolls, results, len); //compare the values in each array, change value to 1 or 0 based on comparison
     const reducer = (accumulator, currentValue) => accumulator + currentValue;
     var successes = results.reduce(reducer);//add up the total number of successes
     var failures = +len - +successes;// get total number of failures for Madness Points
     if (failures > 0) fn.addmadness(name, failures, "exposure");//add madness points to discord feed
     //get the strings for the message response
     var successstring = (successes + " ");//set first string
     const [string1, string2, string3] = await fn.getval(4, len, ["expostring1","expostring2","expostring3"]);//get the remaining string values
     const [string4] = await fn.getval(4, failures, ["expostring4"]);
     var response = (namestring + string1 + namestring + string2 + successstring + string3 + string4);
     message.channel.send(response);
     
  }
  
  async function compare (a, b, c, len){
    for (var i = 0; i < len; i++){
        if (+a[i] > +b[i]) c[i] = 0;
        if (+a[i]<= +b[i]) c[i] = 1;
    }
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