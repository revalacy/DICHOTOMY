const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, subcommand, ...args]) => {
    

  
  var user = message.author.id;//get the user's ID
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  var roll = Math.floor(Math.random() *10)+1;//create the roll variable
  const mom = client.users.get('453297386119233557');
  const dad = client.users.get('133350100264157195');
  const enambris = client.users.get('142847091411124225');
  const stagemin = [0, 10, 50, 75, 90, 100, 150];
  const rollmin = [3, 5, 6, 7, 8, 9, 9];
  
  
  
async function resolve(){
//flow: /madness Name command ...args
//subcommands: sanity, dose, passive, willpower, symptoms, accept, reject, anoint, harvest
var acceptance = await fn.getproperty(2, name, 'accepted');
if (acceptance === '' && subcommand != 'accept' && subcommand != 'reject' && subcommand != 'gift') {message.channel.send('Please check your DMs!'); return message.author.send('Before you can make any rolls for Madness or take any Madness actions, please log your acceptance or rejection. You may do so with one of the following commands: \n\n`/madness ' + name + ' accept`\n\n`/madness ' + name + ' reject`')};
  
if (subcommand === 'sanity'){
  var additional = args[0]|| 1;
  if (+additional > 10) return message.channel.send('That\'s a lot of sanity! Please roll them in batches of 10 to make life easier for me.');
  var channel = message.channel;
  var successes = 0;
  var failures = 0;
  var rollsarray = [];
    var [owner, minimum, stage, points, namestring] = await fn.getval(2, name, ['userid','min','stage', 'madtotal', 'friendlyname']);//get the owner's ID
    if (owner === "none") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//ownership check, respond if fails and exit function
  for (var i = 0; i < additional; i++){
    roll = Math.floor(Math.random() *10)+1;//create the roll variable
    var state = await fn.getstate(roll, minimum);//create state variable
    console.log('state = ' + state);
    successes = +successes + +state;
    if (state === '0') failures = +failures + 1;
    console.log('failures = ' + failures);
    rollsarray[i] = (roll + ' vs ' + minimum);
  };
    var rollstring = rollsarray.join(' | ');
    var msg = ('**#** rolls a sanity check! # points of madness are taken. **[#]**');
    if (+additional > 1) msg = msg.replace(' a ', ' ' + additional + ' ').replace('check', 'checks');
    msg = msg.replace('#', name).replace('#', failures).replace('#',rollstring);
    if (failures === 1) msg = msg.replace('points', 'point').replace(' are ', ' is ');
    message.channel.send(msg);
    var newpoints = +points + +failures;
    setmadness(newpoints);
};
if (subcommand === 'dose'){
  var channel = message.channel;
    var [owner, minimum, stage, points, namestring] = await fn.getval(2, name, ['userid','min','stage', 'madtotal', 'friendlyname']); 
    if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
    var msg = (namestring+'has taken a dose of **Elysian tonic**. This grants you the benefit of concentrated Euphoria, as well as granting **+3** Madness points.');
    messagehandler([msg], channel);
    var newpoints = +points + 3;
    fn.addmadness(name,3,"dose");//adds Name, Date, Type and Command to Discord feed;
    setmadness(newpoints);
};
if (subcommand === 'passive'){
  var channel = message.channel;
    var [owner, minimum, stage, points, namestring] = await fn.getval(2, name, ['userid','min','stage', 'madtotal', 'friendlyname']); 
    if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
    var msg = (namestring+' has chosen to take 1 point of Madness passively for today.');
    messagehandler([msg], channel);
    var newpoints = +points + 1;
    fn.addmadness(name,3,"dose");//adds Name, Date, Type and Command to Discord feed;
    setmadness(newpoints);
};
if (subcommand === 'willpower'){
  var channel = message.channel;
    var [owner, minimum, stage, points, wp, namestring] = await fn.getval(2, name, ['userid','min','stage', 'madtotal', 'wp', 'friendlyname']); 
    if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
    var msg = (namestring+' spends 1 point of Willpower to negate a point of Madness.');
    var newpoints = +points - 1;
    var newwp = +wp - 1;
    fn.setval(2, name, ['madtotal', 'wp'], [newpoints, newwp]);
    fn.addmadness(name, -1, 'willpower');
    messagehandler([msg], channel);
};
if (subcommand === 'accept'){
    var channel = message.channel;
    var [owner, minimum, points, stage, namestring] = await fn.getval(2, name, ['userid', 'min', 'madtotal', 'stage', 'friendlyname']);
    if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
    var newpoints = +points + 1;
    await fn.setval(2, name, ['madtotal', 'accepted', 'shitlist', 'acceptpoint'], [newpoints, 'TRUE', 'FALSE', 1]);
    var msg = ('```' + namestring + ' has accepted Madness! A point of Madness is earned if one has not been earned by accepting previously. Mother and Father are watching, beloved, and they are pleased.```');
    messagehandler([msg], channel);
    var parentmsg = (namestring + ' has accepted Madness! They are removed from the shitlist and have begun accumulating more points.');
    mom.send(parentmsg);
    dad.send(parentmsg);
};
if (subcommand === 'reject'){
    var channel = message.channel;
    var [owner, minimum, points, stage, namestring] = await fn.getval(2, name, ['userid', 'min', 'madtotal', 'stage', 'friendlyname']);
    if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
    if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');
    await fn.setval(2, name, ['accepted', 'shitlist'], ['FALSE', 'TRUE']);
    var msg = ('*`You have rejected the Madness seed, and for now you resist any of the Madness that attempts to take root from the gift, but know you are not protected from other sources, and rejecting does not cleanse existing Madness. Mother\'s Beloved and Father may take your rejection far less kindly, and Mother will likely try again. Be prepared for future engagements.\n\nThe gift may be kept, as Mother gave it freely, though if you intend to move the gift, utilize the command /send # Destination Objectname`*');
    msg = msg.replace('#', name);
    messagehandler([msg], channel);
    var parentmsg = (namestring + ' has rejected Madness and Elysian! Such a disobedient child. ' + namestring + ' has been added to Father\'s naughty list.');
    mom.send(parentmsg);
    dad.send(parentmsg);
};
if (subcommand === 'exposure'){
      var dateObj = new Date(); 
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      let newdate = month + "/" + day + "/" + year;
      var rolls = [];
      var results = [];
      var points = [];
      var channel = message.channel.id;
        var [owner, minpull, namestring, pointspull, acceptstate] = await fn.getproperty(2, name, ['userid', "exposureobject", 'friendlyname', 'madtotal', 'accepted']);//get the owner's ID
        if (owner === 'none') return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
        if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//ownership check, respond if fails and exit function
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
         if (failures > 0 && acceptstate === 'FALSE') fn.addmadness(name, failures, "exposure");//add madness points to discord feed
         var newpoints = +failures + +pointspull;
         if (acceptstate === 'FALSE') setmadness(newpoints);
         //get the strings for the message response
         var msg = ('[**#** has rolled exposure! **#** is currently being exposed to Madness from **#** objects, and rolled **#** successes out of **#** rolls. # points of Madness are taken.]');
         if (acceptstate === 'TRUE') message.author.send('Sshhh, since you have accepted Madness, your exposure generates no points. Don\'t tell anyone!');
         msg = msg.replace('#', namestring).replace('#', namestring).replace('#', len).replace('#', successes).replace('#', len).replace('#', failures);
         messagehandler([msg], channel);
};
if (subcommand === 'anoint'){

  var msg = ('');
  return messagehandler(msg);
};
if (subcommand === 'anchor'){

  var msg = ('');
  return messagehandler(msg);
};
if (subcommand === 'harvest'){

  var msg = ('');
  return messagehandler(msg);
};
if (subcommand === 'symptoms'){
    var argsmax = args.length - 1;
    var action = args[0];
    var msg = ('');
  
    var [ownwer, accepted, symptoms, awaitingsymp, namestring] = await fn.getval(2, name, ['userid', 'accepted', 'symptoms', 'awaitingsymp', 'friendlyname']);//pull owner id, accepted, symptoms, number of symptoms needed

    return messagehandler(msg);
};
if (subcommand === 'gift'){
    var target = args.shift();
    var action = args.shift();
    var object = args.join(' ');
    var objectstring = object + ',';
    var cmdgen = 'send';
    console.log('user = ' + user);
    
    
    if (message.author != mom && message.author != dad && message.author != enambris) return message.channel.send('*Sorry dear one, Mother cannot let you do that.*');
    var targetindex = await fn.getproperty(13, target, 'indexval');
    var [parentpocket, ] = await fn.getval(2, name, ['inventory']);
    var [inventory, userid, targetname] = await fn.getval(targetindex, target, ['inventory', 'userid', 'friendlyname']);
    var targetuser = client.users.get(userid);
    var [effects, giftlocation, hasmsg, description, giftname, remaining] = await fn.getval(9, object, ['effects', 'location', 'hasmsg', 'giftmsg', 'friendlyname', 'remaining']);
    var effect = effects.split(',');
    var len = effect.length;
    var trigger = 0;
    for (var i = 0; i < len; i++){
         if (effect[i] === '1') trigger = 1;
         };
    if (trigger === 0) return message.channel.send('This item is not one of Mother and Father\'s gifts. Make the adjustment in the database as needed.');
    if (action === 'take'){
      var n = inventory.indexOf(object);
      if (n === -1) return message.channel.send('');
      inventory = inventory.replace(objectstring, '');
      parentpocket = (parentpocket + objectstring);
      fn.effectreverse(target, object, cmdgen);
      fn.effectexecute(name, object, cmdgen);
      var msg = ('```What\'s this? Something seems to have vanished... where did ' + giftname + ' go?```');
      if (targetindex === '2') messagehandler([msg], targetuser);
      await fn.setval(targetindex, target, ['inventory'], [inventory]);
      await fn.setval(2, name, ['inventory'], [parentpocket]);
      await fn.setval(9, object, ['location'], [name]);
      message.channel.send('Done!');
    };
    if (action === 'give'){
        var givemsg = ('*Will you accept the Seed of Mother’s gift? It speaks to your soul, in languages your mind cannot comprehend. Accept, and you will know freedom through the Madness. Reject, and no Madness will come to you... for now. To accept the seed of this gift, write the following command in this channel:*\n\n`/madness # accept`\n\n*If you choose instead to reject this gift, copy the following command to this channel instead:*\n\n`/madness # reject`\n\n*You will also need to determine where your gift has gone since receiving it initially. Some gifts have been sent to various locations that are no longer accessible ICly, please do not worry about these and send them anyway! If you sent the gift off, review the following commands and utilize the appropriate one:*\n\n`/send # HQLockup #` *to send the gift to Headquarters\' secure containment.*\n\n`/send # SCPLockup #` *to send the gift to the Revenants Toll Facility\'s secured lockup.*\n\n`/send # Luke #` *to send the gift to Luke.* \n\n`/send # Serris #` *to send the gift to Serris.*\n\n\n**Please make sure you send the gift to the location you sent it to** ***originally*** **if you need to send it away!**');
        givemsg = givemsg.replace('#', target).replace('#', target).replace('#', target).replace('#', object).replace('#', target).replace('#', object).replace('#', target).replace('#', object).replace('#', target).replace('#', object).replace('#', target).replace('#', object);
        inventory = (inventory + objectstring);
        fn.setval(targetindex, target, ['inventory'], [inventory]);
        if (giftlocation != name && giftlocation != 'blank') {
              var locindex = await fn.getproperty(13, giftlocation, 'indexval');
              var [locinventory, locid] = await fn.getval(locindex, giftlocation, ['inventory', 'userid']);
              locinventory = locinventory.replace(objectstring, '');
              await fn.setval(locindex, giftlocation, ['inventory'], [locinventory]);
              if (locindex === '2'){
                  var oldhome = client.users.get(locid);
                  var gonemsg = ('```What\'s this? Something seems to have vanished... where did ' + giftname + ' go?```');
                  oldhome.send(gonemsg);
              };
              await fn.effectreverse(giftlocation, object, cmdgen);
            };
        if (giftlocation === name){
          parentpocket = parentpocket.replace(objectstring, '');
          await fn.setval(2, name, ['inventory'], [parentpocket]);
          await fn.effectreverse(name, object, cmdgen);
        };
      if (remaining === '1') remaining = 0;
      fn.setval(9, object, ['location', 'remaining'], [target, remaining]);
      
      fn.effectexecute(target, object, cmdgen);
      var msgs = description.split('\n\n\n');
      var len = msgs.length;
      msgs[len] = givemsg
      messagehandler(msgs, targetuser);
      message.channel.send('Done!');
      };
};
}

async function setmadness(a){
    var mp = parseInt(a);
    if (mp > 100) mp = 100;
    var minroll;
    var stage;
    for (var o = 0; o < 6; o++){
      var min = stagemin[o];
      if (+mp < +min) {console.log('min less than mp'); continue;};
      minroll = rollmin[o];
      stage = [o];
    };
    fn.setval(2, name, ['madtotal', 'min', 'stage'], [mp, minroll, stage]);
}

async function symptomcheck(){

}
  
async function compare (a, b, c, len){
  for (var i = 0; i < len; i++){
      if (+a[i] > +b[i]) c[i] = 0;
      if (+a[i]<= +b[i]) c[i] = 1;
  }
}

async function messagehandler (a, b){
        var msgarray = a;
        var msgchannel = b;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']]',']**').replace('<>','');
          var n = msgarray[i].indexOf('<');
          console.log('n = ' + n);
          if (n != -1) {var [replacemsg, url] = msgarray[i].split('|'); console.log(url); msgarray[i] = replacemsg; url = url.replace('>',''); console.log(msgarray[i] + ';' + url); msgchannel.send(msgarray[i], {files: [url]});};
          if (n === -1) msgchannel.send(msgarray[i]);
        }, timeoutstack[i]);
        }
        for (var i = 0; i < msgarray.length; i++){
         timeoutstack[i] = 5000 * i;
         doSetTimeout(i);
        }}

resolve();
}