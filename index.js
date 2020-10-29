const Discord = require('discord.js');
const {prefix,token,suits,values} = require('./config.json');
bot = new Discord.Client();
const fs = require('fs');


bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
  const command = require(`./commands/${file}`);

  bot.commands.set(command.name,command);
}


function initializeDeck(){
  var deck = new Array();
  for(var i = 0; i< suits.length; i++){
    for(var j = 0; j < values.length; j++){
      var card = {value: values[j], suit: suits[i]};
      deck.push(card);
    }
  }
  // console.log(deck.length);
  return deck;
}

bot.once('ready',()=>{
  deck = initializeDeck();
  discard = new Array();
  // console.log(deck);
  console.log("bot ready!");
});




bot.on('message',message =>{
  if(!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(" ");
  const commandName = args.shift().toLowerCase();
  console.log(commandName);  
  
  //if command name doesn't exist exit
  if (!bot.commands.has(commandName)) return;
  
  const command = bot.commands.get(commandName);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('I had trouble following that. Please check your message or let the bot dude know.');
  }

});









bot.login(token);
