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
var fn = require ('./functions.js');

async function getprop (a, b, c){
  let indexval = a;
  let searchval = b;
  let key = c;
  return new Promise(resolve => {
  doc.getRows(+indexval, {'query': 'label = "' + searchval + '"'},function(err,row){
    let x = row[0][key];
    resolve (x)
  })
 })
}

async function setprop (a, b, c, d){
  let index = a;
  let searchval = b;
  let key = c;
  let value = d;
  doc.getRows(+index, {'query': 'label = "' + searchval + '"'},function(err,row){
      row[0][key] = value;
      row[0].save()
  })
}

async function getval(a, b, c){
     let index = parseInt(a);
     let searchval = b;
     let keys = c;
     var x = []
  return new Promise(resolve => {
   doc.getRows(index, {'query': 'label = "' + searchval + '"'},function(err,row){
      if (err) console.log(err);
      
     for (var i = 0; i < keys.length; i++){
        let key = keys[i];
        x[i] = row[0][key];
     }
    resolve (x);
    })
  })
    }

//Remember that all async functions resolving promises must have their function variables declared as local variables BEFORE the Promise object
var roll = Math.floor(Math.random() *10)+1;
var name;



module.exports =  {
  
setexposure: async function(a, b, c, d){
  let key = a;//keystring
  let target = b;//target
  let value = c;//valuestring
  let item = d;
  var exposuremin = await getprop(4, value, 'exposuremin');//take value (exposure level) and get exposuremin from sheet 4
  var exposurestring = await getprop(2, target, key);//get target's exposure string from index sheet
  var newexposure = (item + " " + exposuremin + ",");//combine item with exposuremin to string (item min,)
  var exposure = (exposurestring + newexposure);//add new entry to end of exposure string
  return setprop(2, target, key, exposure);//set exposure
  
},
  
  
modifyvalue: async function (a, b, c, d){
  let key = a;//keystring
  let target = b;//targetstring
  let value = c;//valuestring
  let item = d;
  var index = await getprop(13, target, 'indexval');
  var incval = await getprop(+index, target, key);//get existing value of key search
  console.log(incval);
  var newval = (+incval + +value);//create the new value
  console.log(newval);
  setprop(index, target, key, newval);//set the new value
  
},
  
objectmove: async function (a, b, c, d){
    let key = a;//keystring
    let target = b;//targetstring
    let value = c;//valuestring
    let item = d;
    var cmdgen = key;
    var a = item;
  var objectstring = (a + ',');
    var index = await getprop(13, target, 'indexval');
    var inventory = await getprop (index, target, 'inventory');
    var newinventory = inventory.replace(objectstring, '');
    setprop(index, target, 'inventory', newinventory);
    this.effectreverse(target, a, cmdgen);//reverse exposure on gift object
    setprop(9, item, 'location','Elysian');
    var home = await getprop(8, 'Elysian','inventory');
    var wenthome = (home + objectstring);
    setprop(8, 'Elysian','inventory',wenthome);
    //create randomly add new effect to object
    //alert mom and dad object has gone home
},
  
changeval: async function (a, b, c, d){
  let key = a;//keystring
  let target = b;//targetstring
  let value = c;//valuestring
  let item = d;
  
  var index = await getprop(13, target, 'indexval');
  setprop(index, target, key, value);
},
  
    hpresolve: async function (a, b, c, d){
    let key = a;//keystring
    let target = b;//targetstring
    let value = c;//valuestring
    let item = d;
      
    var healthchange = parseInt(value);
    var [hp, maxhp, soak] = await this.getval(2, target, ['hp','maxhp','soak']);
    var hpcheck = +hp + +healthchange;
    if (+hpcheck < hp) healthchange = +healthchange + +soak;
    var newhp = +hp + +healthchange;
    if (+newhp > +maxhp) newhp = maxhp;
    this.setval(2, target, ['hp'], [newhp]);
  },
  
exposurereverse: async function(a, b, c, d){
  console.log('Reversing exposure.');
  let key = a;//keystring
  let target = b;//targetstring
  let value = c;//valuestring
  let item = d;
  var exposuremin = await getprop(4, value, "exposuremin");//take value (exposure level) and get exposuremin from sheet 4
  var exposurestring = await getprop(2, target, key);//get target's exposure string from index sheet
  var newexposure = (item + " " + exposuremin + ",");//combine item with exposuremin to string (item | min)
  var exposurereplace = exposurestring.replace(newexposure,"");  //replace exposure with blank to remove object from the string
  setprop(2, target, key, exposurereplace);//set exposure
  
},
  
  
modifyreverse: async function (a, b, c, d){
  let key = a;//keystring
  let target = b;//targetstring
  let value = c;//valuestring
  let item = d;
 var index = await getprop(13, target, 'indexval');
  var replaceinc = +value *-1
  var incval = await getprop(index, target, key);//get existing value of key search
  var newval = (+incval + +replaceinc);//create the new value
  setprop(index, target, key, newval);//set the new value
},
  
  effectreverse: async function (a, b, c){
    var targets = a;
    var obj = b;
    var trgr = c;
    var index = await getprop(13, targets, 'indexval');
    if (index === '8') targets = await getprop(8, targets, 'occupants');
    var effectprop = await getprop(9, obj, "effects")//get string of effect indexes for object
    var effects = effectprop.split(',');
    var targetarray = targets.split(',');
    for (var y = 0; y < targetarray.length; y++) {
    let target = targetarray[y];
    for (var i = 0; i < effects.length; i++){//for each effect index pull the properties
    let effect = effects[i];
    var [changefunc, key, value, triggers, timerval] = await getval(11, effect, ["changefunc", "keys", "values", "triggers", "timerval"]);
    var n = triggers.indexOf(trgr);//check that trigger is good
    if (n === -1) continue;
    if (index === '8' && changefunc === 'setexposure') key = 'exposurelocation';
    var reversal = await getprop(4, changefunc, "replace");
    this[reversal](key, target, value, obj);//create execution function
  }
   }
  },
  
}