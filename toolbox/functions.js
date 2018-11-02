const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./client_secret.json');
    const doc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const eventdoc = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    eventdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});


//Remember that all async functions resolving promises must have their function variables declared as local variables BEFORE the Promise object

var efn = require('./effects.js');


module.exports =  {

doom: async function(a){//adds a doom point
      let char = a; 
      doc.getRows(2,{
           'query':'label = "' + char + '"'
         },function (err,row){
           if (!row) return console.log('An error has occurred, terminating the function Doom.');
           let old = row[0].doom;
           let doom = +old + 1;
           row[0].doom = doom;
           row[0].save()
         }
           )},
  
setval: async function(a, b, c, d){//sets values to core database, accepts arguments keys and values in array form
     let index = parseInt(a);
     let searchval = b;
     let keys = c;
     let values = d;
   doc.getRows(index, {'query': 'label = "' + searchval + '"'},function(err,row){
      if (!row) return console.log('An error occurred. Terminating function setval.')
      for (var i = 0; i < keys.length; i++){
        let key = keys[i];
        let value = values[i]
        row[0][key] = value;
     }
        row[0].save();
        return;
    })
    },
  
getval: async function(a, b, c){//pulls values from core database, accepts arguments keys and values in array form
     let index = parseInt(a);
     let searchval = b;
     let keys = c;
     var x = []
  return new Promise(resolve => {
   doc.getRows(index, {'query': 'label = "' + searchval + '"'},function(err,row){
      if (!row) {x = 'none'; console.log('An error occurred during getval function execution. Unable to pull data for ' + searchval + '. Returning value "none".'); return resolve(x)};
      
     for (var i = 0; i < keys.length; i++){
        let key = keys[i];
        x[i] = row[0][key];
     }
    resolve (x);
    })
  })
    },
  
addmadness: async function (a, b, c){//adds to Madness calc doc
   var dateObj = new Date();
           var month = dateObj.getUTCMonth() + 1; //months from 1-12
           var day = dateObj.getUTCDate();
           var year = dateObj.getUTCFullYear();
  let newdate = month + "/" + day + "/" + year;
  let char = a;
  let value = b;
  let command = c;
    doc.addRow(3,{label: char, date: newdate, value: value, commandgen: command},function(err){
      if (err) console.log(err);
    });
  },
  
getstate: async function (a, b){//returns 0 or 1, used as boolean success/failure
      let total = a;
      let target = b;
      return new Promise(resolve => {
        var x = "0";
        var y = "1";
        if (+target > +total) return resolve (x);
        resolve (y);
      })
  },
  
getproperty: async function (a, b, c){//pull single value from database
 let index = a;
 let char = b;
 let searchkey = c;
  
  return new Promise(resolve => {
    doc.getRows(+index, {'query': 'label = "' + char + '"'}, function(err, row){
      var x;
      if(!row) {x = 'none'; console.log('An error occurred during property pull. Unable to pull data for ' + char + '.');return resolve(x)};
      x = row[0][searchkey];
      resolve (x);
    })
  })
},
  
effectexecute: async function (a, b, c){//executes effects on the target object
   var targets = a;
   var obj = b;
   var trgr = c;
   var index = await this.getproperty(13, targets, 'indexval');
    if (index === '8') targets = await this.getproperty(8, targets, 'occupants');
      console.log('targets = ' + targets);
    if (targets === '') return;
    var effectprop = await this.getproperty(9, obj, "effects")//get string of effect indexes for object
    var effects = effectprop.split(',');
    var targetarray = targets.split(',');
   for (var y = 0; y < targetarray.length; y++) {
     let target = targetarray[y];
     if (target === '') continue;
  for (var i = 0; i < effects.length; i++){//for each effect index pull the properties
    let effect = effects[i];
    var [changefunc, key, value, triggers, timerval] = await this.getval(11, effect, ["changefunc", "keys", "values", "triggers", "timerval"]);
    var n = triggers.indexOf(trgr);//check that trigger is good
    console.log(n);
    if (n === -1) continue;
    efn[changefunc](key, target, value, obj);//create execution function
  }
   }
  
},
  
effectreverse: async function(a, b, c){//reverses effects on the target object
    var targets = a;
    var obj = b;
    var trgr = c;
    var index = await this.getproperty(13, targets, 'indexval');
    if (index === '8') targets = await this.getproperty(8, targets, 'occupants');
    console.log('targets = ' + targets);
    if (targets === '') return;
    var effectprop = await this.getproperty(9, obj, "effects")//get string of effect indexes for object
    var effects = effectprop.split(',');
    var targetarray = targets.split(',');
    for (var y = 0; y < targetarray.length; y++) {
    let target = targetarray[y];
      if (target === '') continue;
    for (var i = 0; i < effects.length; i++){//for each effect index pull the properties
    let effect = effects[i];
    var [changefunc, key, value, triggers, timerval] = await this.getval(11, effect, ["changefunc", "keys", "values", "triggers", "timerval"]);
    var n = triggers.indexOf(trgr);//check that trigger is good
    if (n === -1) continue;
    var reversal = await this.getproperty(4, changefunc, "replace");
    efn[reversal](key, target, value, obj);//create execution function
  }
   }
        
      
  },
  
sumstring: async function(a){//takes stat value input, splits the string, and adds each value together. x is the total value, y is the original base stat.
    let string = a;//the string that requires chopping and adding
    var x = 0;
    console.log(string);
    return new Promise(resolve => {
      let stringsplit = string.split(',');
      var y = stringsplit[0];
      for (var i = 0; i < stringsplit.length; i++){
       x += +stringsplit[i];
      };
       console.log(x + ' base stat = ' + y);
       resolve ([x,y]);
    })
  },
  
hpresolve: async function (a, b){//takes target and the pending health change and resolves them
    var target = a;
    var healthchange = parseInt(b);
    var [hp, maxhp, soak] = await this.getval(2, target, ['hp','maxhp','soak']);
    var hpcheck = +hp + +healthchange;
    if (+hpcheck < hp) healthchange = +healthchange + +soak;
    var newhp = +hp + +healthchange;
    if (+newhp > +maxhp) newhp = maxhp;
    this.setval(2, target, ['hp'], [newhp]);
  },
  
  
dmcooldownreset: async function(a, b){//checks cooldown for commands that are used in DM; applies to /investigate, /damage, 
   var cmd = a;
   var char = b;
   var cooldownpull = this.getproperty(2, char, 'cooldowns');
   return new Promise(resolve => {
   var cooldowns = cooldownpull.split(',');
   var timestamp;
   for (var i = 0; i < cooldowns.length; i++){
   var cooldown = cooldowns[i];
    console.log(cooldown);
  if (cooldown === '') continue;
   var m = cooldown.indexOf(cmd);
   if (m === -1) continue;
   var [commandgen,time] = cooldown.split('|');
   timestamp = new Date(time);
   var cooldownend = new Date(timestamp.getTime() + 20*60000);
   var now = new Date();
    var q;
   if (now > cooldownend) {
     var cooldownstring = (cooldown+',');
     var cooldownreset = cooldownpull.replace(cooldownstring,'');
     var newcooldowns = (cooldownreset + cmd + '|' + now + ',');
     this.setval(2, char, ['cooldowns'], [newcooldowns]);
     q = 1;
     }else{q = 0};
     return resolve(q);
    };
  })
 },
  
eventcdcheck: async function(){
    
  },
  
querydoc: async function(a, b, c, d) {//queries the doc using provided index, query, search value, and key to return.
    var index = a;  
    var querykey = b;
    var searchval = c;
    var key = d;
    return new Promise(resolve => {
      doc.getRows(index, {'query': querykey + '= "' + searchval + '"'},function(err,row){
        if (!row) return "none";
        var x = row[0][key];
        resolve (x);
    });
    })
  },

  eventsetup: async function(a){
    var searchval = a;
    var x = [];
    var keys = ['label','title','starttime','gms','room','set','platform','blurb'];
   
      eventdoc.getRows(1,{'query':'label = ' + searchval + '"'},function(err,row){
        if (!row){x = 'none'; console.log('An error has occurred in the process of pulling event data for setup. Function eventsetup terminated.'); return resolve(x)};
        for (var i = 0; i < keys.length; i++){
          var key = key[i];
          x[i] = row[0][key];
        };
        this.setval(7,'open',keys,x);
      });
    
  },

  eventopencheck: async function(a){
      var searchval = a;
      var keys = ['label','title','starttime','gms','room','set','platform','blurb'];
      var x = 0;
      return new Promise(resolve =>{
        eventdoc.getRows(1,{'query':'label = ' + searchval + '"'},function(err,row){
          if (!row){x = 'none'; console.log('An error has occurred in the process of pulling event data for setup. Function eventsetup terminated.'); return resolve(x)};
          for(var i = 0; i < keys.length; i++){
            key = keys[i];
            var y = 0;
            if (row[0][key] === '') y = -1;
            x += y;
          };
          resolve (x);
      });
    });
  },

  eventstartcheck: async function(a){
      var searchval = a;
      var keys = ['title', 'state','starttime','gms','room','set','platform','npcs','startmsg','endmsg','roundmessages'];
      var x = 0;
      return new Promise(resolve => {
        doc.getRows(7,{'query':'label = ' + searchval + '"'},function(err,row){
            for (var i = 0; i < keys.length; i++){
              var key = keys[i];
              var y = 0;
              if (row[0][key] === '') y = -1;
              x += y;
            };
            resolve (x);
        });
      });
  },
  
}