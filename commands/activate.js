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
exports.run = (client, message, [location]) => {
  
  async function resolve(){
    var channel = client.channels.get('500385281849950208');
    var inventory = await fn.getproperty(8,location,'inventory');
    var entrance = await fn.getproperty(8,location,'description');
    var locationname = await fn.getproperty(8,location,'friendlyname');
    var inventorysplit = inventory.split(',').join(', ');
    var msg = ('You have entered' + locationname + entrance + ' You may investigate the following objects: ' + inventorysplit + '.');
    channel.send(msg);
   }
 
  resolve();
}