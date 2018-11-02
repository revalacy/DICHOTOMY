exports.run = (client, message, args) => {
  if(!args || args.size < 1) return message.reply("you must provide a command name to reload.");
  if(!message.member.roles.find(x => x.name === "GM")) return message.channel.send('You must be a GM to use that command. Please contact an admin if you believe this message was sent in error.');
  const commandName = args[0];
  // Check if the command exists and is valid
  if(!client.commands.has(commandName)) {
    return message.reply("that command does not exist.");
  }
  // the path is relative to the *current folder*, so just ./filename.js
  delete require.cache[require.resolve(`./${commandName}.js`)];
  // We also need to delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName);
  const props = require(`./${commandName}.js`);
  client.commands.set(commandName, props);
  message.channel.send(`The command ${commandName} has been reloaded.`);
  console.log('Reloading ' + commandName);
};