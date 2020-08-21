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
  console.log(deck.length);
  return deck;
}



bot.once('ready',()=>{
  deck = initializeDeck();
  discard = new Array();
  console.log("bot ready!");
  console.log(deck);
});




bot.on('message',message =>{
  if(!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();
  console.log(command);  
  if(command === 'flip'){
    bot.commands.get('flip').execute(message,args);
  }else if(command ==="shuffle"){
    bot.commands.get('shuffle').execute(message,args);
  }
});













bot.login(token);