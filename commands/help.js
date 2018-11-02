exports.run = (client, message, args) => {

    let type = args[0]||"all";
    
          if (type === "all"){
           message.author.send('```AVAILABLE COMMANDS\n\n```\n\n*For the below commands, you will use these variables:*\n\n`X`: Your relevant ability modifier.\n`Y`: Any bonus granted by the GM.\n`[Action declaration]`: The action you intend to take. Must be declared in brackets and with your roll command.\n`Name`: The name of the character taking the action.\n`Target`: The name of the character or object you are targeting. For event enemies, consult the your GM for a list of available targets.\n```Standard Commands```\n\n`/roll Name X Y`: Rolls 1d10 plus your relevant skill modifier. Evaluates success.\n`/dice`: Rolls 1d10. Does not evaluate success\n`/cointoss`: Tosses a coin, comes up heads or tails.\n`/willpower Name`: Spends +1 point of Willpower to overcome a mental hurdle.\n```Combat Commands```\n\n`/attack Name X Target`: Rolls 1d10 plus the relevant skill modifier. If not a failure, adds pending attack to target. Resolves immediately for NPCs. This command cannot be used outside of events.\n`/defense Name`: Rolls 1d10 plus the relevant skill modifier. If defense fails, opens a window for Cover. This command cannot be used outside of events.\n`cover Name Target`: Sacrificial! Attempts to reach the target in time to either deflect or absorb the incoming damage from that person\'s failed defense. This command cannot be used outside of events.\n`/heal Name Target`: Rolls 1d10 plus the relevant skill modifier. Heals the target for the evaluated amount, based on INT modifier. This command cannot be used outside of events.\n```Madness Commands```\n\n`/sanity Name`: Rolls 1d10 and evaluates success or failure based on your Madness stage.\n`/exposure Name`: Rolls a 1d10 and evaluates success or failure based for each roll. Exposure is based on the number of Madness-generating objects in the character\'s inventory or current location.\n`/willpower Name madness`: Spends +1 point of Willpower to negate an incurred point of Madness.');
           message.channel.send(`You will receive a private message with all available commands.`)
          }
          if(type==="standard"){
            message.author.send('```AVAILABLE COMMANDS\n\n```\n\n*For the below commands, you will use these variables:*\n\n`X`: Your relevant ability modifier.\n`Y`: Any bonus granted by the GM.\n`[Action declaration]`: The action you intend to take. Must be declared in brackets and with your roll command.\n`Name`: The name of the character taking the action.\n`Target`: The name of the character or object you are targeting. For event enemies, consult the your GM for a list of available targets.\n```Standard Commands```\n\n`/roll Name X Y`: Rolls 1d10 plus your relevant skill modifier. Evaluates success.\n`/dice`: Rolls 1d10. Does not evaluate success\n`/cointoss`: Tosses a coin, comes up heads or tails.\n`/willpower Name`: Spends +1 point of Willpower to overcome a mental hurdle.');
            message.channel.send(`You will receive a private message with all available commands.`)
          }
          if (type==="combat"){
            message.channel.send('```AVAILABLE COMMANDS\n\n```\n\n*For the below commands, you will use these variables:*\n\n`X`: Your relevant ability modifier.\n`Y`: Any bonus granted by the GM.\n`[Action declaration]`: The action you intend to take. Must be declared in brackets and with your roll command.\n`Name`: The name of the character taking the action.\n`Target`: The name of the character or object you are targeting. For event enemies, consult the your GM for a list of available targets.\n```Combat Commands```\n\n`/attack Name X Target`: Rolls 1d10 plus the relevant skill modifier. If not a failure, adds pending attack to target. Resolves immediately for NPCs. This command cannot be used outside of events.\n`/defense Name`: Rolls 1d10 plus the relevant skill modifier. If defense fails, opens a window for Cover. This command cannot be used outside of events.\n`cover Name Target`: Sacrificial! Attempts to reach the target in time to either deflect or absorb the incoming damage from that person\'s failed defense. This command cannot be used outside of events.\n`/heal Name Target`: Rolls 1d10 plus the relevant skill modifier. Heals the target for the evaluated amount, based on INT modifier. This command cannot be used outside of events.');
            message.channel.send(`You will receive a private message with all available commands.`)
          }
          if(type==="madness"){
            message.author.send('```AVAILABLE COMMANDS\n\n```\n\n*For the below commands, you will use these variables:*\n\n`X`: Your relevant ability modifier.\n`Y`: Any bonus granted by the GM.\n`[Action declaration]`: The action you intend to take. Must be declared in brackets and with your roll command.\n`Name`: The name of the character taking the action.\n`Target`: The name of the character or object you are targeting. For event enemies, consult the your GM for a list of available targets.\n```Madness Commands```\n\n`/sanity Name`: Rolls 1d10 and evaluates success or failure based on your Madness stage.\n`/exposure Name`: Rolls a 1d10 and evaluates success or failure based for each roll. Exposure is based on the number of Madness-generating objects in the character\'s inventory or current location.\n`/willpower Name madness`: Spends +1 point of Willpower to negate an incurred point of Madness.');
            message.channel.send(`You will receive a private message with all available commands.`)
          }
       }