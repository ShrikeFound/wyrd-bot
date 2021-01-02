const Discord = require("discord.js");
const { prefix, token, suits, values, fatemaster_id } = require("./config.json");
bot = new Discord.Client();
const fs = require("fs");
const { type } = require("os");
const { Console } = require("console");
bot.decks = require("./decks.json");
bot.characters = require("./characters.json");


//bot commands start -----------------------------

bot.commands = new Discord.Collection();


const fate_shuffle_command = {
  name: "shuffle",
  description: "shuffles the twist deck (or fate deck if you're the FM)",
  execute(message, args) {
    console.log(isFM(message.author.id));
    if (isFM(message.author.id)){
      fate_deck = readDeck(0);
      shuffle(fate_deck);
      console.log(fate_deck);
      writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
      message.channel.send("deck shuffled");
    } else {
      twist_deck = readDeck(message.author.id);
      shuffle(twist_deck);
      console.log(twist_deck);
      writeDeck(0, twist_deck.cards, twist_deck.hand, twist_deck.discard);
      console.log("twist deck shuffled.");
    }
  }
}
bot.commands.set(fate_shuffle_command.name, fate_shuffle_command);


const fate_flip_command = {
  name: "flip",
  description: "flips a number of cards from the fate deck",
  execute(message,args) {
    num = Number(args[0]);
    if (!num > 0) {
      num = 1;
    }
    console.log(num);

    fate_deck = readDeck(0);


     flippedCards = flip(fate_deck, num).map(
      (card) => card.value + " of " + card.suit
    );

    writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
    message.channel.send("cards flipped: " + flippedCards);
    console.log(fate_deck.cards.length)
    console.log(fate_deck.hand.length)
    console.log(fate_deck.discard.length)
  }
}
bot.commands.set(fate_flip_command.name, fate_flip_command);



const twist_initialize_command = {
  name: "create",
  description: "creates a twist deck for the player",
  execute(message, args) {
    let definining_suit = args[0] || "unknown";
    let ascendant_suit = args[1] || "unknown";
    let center_suit = args[2] || "unknown";
    let descendant_suit = args[3] || "unknown";
    
    twist_deck = createDeck(definining_suit, ascendant_suit, center_suit, descendant_suit);

    //move 3 cards to to the player's hand
    draw(twist_deck, 3);
    writeDeck(message.author.id, twist_deck.cards, twist_deck.hand, twist_deck.discard);

  },
};
bot.commands.set(twist_initialize_command.name, twist_initialize_command);



const twist_show_command = {
  name: "show",
  description: "shows a player's twist hand",
  execute(message, args) {
    // if (isFM(message.author.id)) return;
 
    deck = readDeck(message.author.id)
    hand = deck.hand.map(
      (card) => card.value + " of " + card.suit
    );
    discard = deck.discard.map(
      (card) => card.value + " of " + card.suit
    );
    if (args[0] == "hand") {
      message.author.send(message.author.username+ "'s hand: "+hand);      
    } else if (args[0] == "discard") {
      message.author.send(message.author.username+ "'s discard pile: "+discard);      
    } else if (args[0] == "me") {
      if (args[1] == "the") {
        if (args[2] == "money") {
          message.react("💸").then(message.react("💰")).then(message.react("💵")) 
                  
       } 
      }
    } else {
      message.author.send(message.author.username+ "'s hand: "+hand +"\n"+message.author.username+"'s discard pile: "+discard);      
    }

  }
}
bot.commands.set(twist_show_command.name,twist_show_command)


const twist_draw_command = {
  name: "draw",
  description: "draws cards from the player's twist deck",
  execute(message, args) {
    // if (isFM(message.author.id)) return;
    twist_deck = readDeck(message.author.id)
    num = parseInt(args[0])
    if (!(num > 0)) {
      num = 1;
    }
    draw(twist_deck, num);
    writeDeck(message.author.id, twist_deck.cards, twist_deck.hand, twist_deck.discard);
  }
}
bot.commands.set(twist_draw_command.name, twist_draw_command);

const twist_discard_command = {
  name: "discard",
  description: "discards a card from the player's twist deck.",
  execute(message, args) {
    var value = parseInt(args[0]);
    var twist_deck = readDeck(message.author.id);
    cheatedCard = cheat(twist_deck, value);
    if (cheatedCard === undefined) {
      // message.channel.send("You don't have that card.");
      return;
    };
    message.channel.send(message.author.username+" discarded: "+cheatedCard.value+" of "+cheatedCard.suit);
    writeDeck(message.author.id,twist_deck.cards,twist_deck.hand,twist_deck.discard)
  }
}
bot.commands.set(twist_discard_command.name,twist_discard_command)


const twist_cheat_command = {
  name: "cheat",
  description: "cheats a card; moves it from the player's hand to the discard pile.",
  execute(message, args) {

    //card values are ints so we need to parse the argument as an int
    var value = parseInt(args[0]);
    var twist_deck = readDeck(message.author.id);
    cheatedCard = cheat(twist_deck, value);
    if (cheatedCard === undefined) {
      // message.channel.send("You don't have that card.");
      return;
    };
    message.channel.send(message.author.username +" cheated with: "+cheatedCard.value+" of "+cheatedCard.suit);
    writeDeck(message.author.id,twist_deck.cards,twist_deck.hand,twist_deck.discard)
  }
}
bot.commands.set(twist_cheat_command.name,twist_cheat_command)


const character_set_attribute = {
  name: "set",
  description: "sets attribute of character sheet to chosen value",
  execute(message, args) {
    let attribute = args[0] || "blank";
    attribute = attribute.toLowerCase();

    let value = args[1] || 0;
    value = parseInt(value);
    

    if (bot.characters[message.author.id] === undefined) {
      createUser(message.author.id)
    } else {
    }

    setAttribute(message.author.id,attribute,value)

  }
}
bot.commands.set(character_set_attribute.name,character_set_attribute)

const character_reset = {
  name: "reset",
  description: "resets character sheet",
  execute(message, args) {
    createUser(message.author.id);
  }
}
bot.commands.set(character_reset.name, character_reset);


// const character_read = {
//   name: "read",
//   description: "reads character sheet",
//   execute(message, args) {
//     console.log(bot.characters[message.author.id]["flexible"])
//     let asp = bot.characters[message.author.id]["flexible"]["aspect"]
//     console.log(asp);
//     console.log(bot.characters[message.author.id][asp])
//   }
// }
// bot.commands.set(character_read.name,character_read)


const help_command = {
  name: "help",
  description: "lists commands and other stuff",
  execute(message, args) {
    let help_message = "commands:\n"
    bot.commands.forEach((values,key)=>{
      help_message += ("**!" + key + ":** " + values["description"]+"\n");
    })
    message.author.send(help_message);
  }
}
bot.commands.set(help_command.name,help_command)





//bot commands end -----------------------------



function findSuit(string) {
  char = string.charAt(0).toLowerCase();
  suit = "";
  switch (char) {
    case "m":
      suit = "masks";
      break;
    case "r":
      suit = "rams";
      break;
    case "c":
      suit = "crows";
      break;
    case "t":
      suit = "tomes";
      break;
    default:
      suit = "unknown";
      break;
  }
  return suit;
  }




function createDeck(suits, values, center, descendant) {
  
  var deck = {};
  deck.cards = new Array();
  deck.discard = new Array();
  deck.hand = new Array();
  if (arguments.length == 4) {
    //create defining cards
    definining_values = [1, 5, 9, 13];
    ascendant_values = [4, 8, 12];
    center_values = [3, 7, 11];
    descendant_values = [2, 6, 10];

    function add_twist_set(values, suit) {
      suit = findSuit(suit);
      values.forEach((value) => {
        var card = { value: value, suit: suit };
        deck.cards.push(card);
      });
    }

    add_twist_set(definining_values, suits);
    add_twist_set(ascendant_values, values);
    add_twist_set(center_values, center);
    add_twist_set(descendant_values, descendant);
  } else {
    for (var i = 0; i < suits.length; i++) {
      for (var j = 0; j < values.length; j++) {
        var card = { value: values[j], suit: suits[i] };
        deck.cards.push(card);
      }
    }
  }
  shuffle(deck);
  return deck;

}





function shuffle(deck) {
  deck.cards = deck.cards.concat(deck.discard)
  deck.cards = deck.cards.concat(deck.hand)
  deck.discard = []
  deck.hand = []
  for (var i = 0; i < 1000; i++) {
    var randomLocation = Math.floor(Math.random() * deck.cards.length);
    var temp = deck.cards[0];
    deck.cards[0] = deck.cards[randomLocation];
    deck.cards[randomLocation] = temp;
  }
}



function writeDeck(authorID, deck, hand, discard) {
  
  bot.decks[authorID] = {
    cards: deck,
    hand: hand,
    discard: discard
  }

  fs.writeFile("./decks.json", JSON.stringify(bot.decks,null,4), err => {
    if (err) throw err;
  });

}





//gets WHOLE deck as object from JSON. has: deck,hand,discard
function readDeck(authorID) {
  
  let deck = bot.decks[authorID];
  return deck

}



function draw(deck, numflips) {
  var drawnCards = [];
  for (var i = 0; i < numflips; i++) {
    if (deck.cards.length <= 0) {
      if (deck.discard.length <= 0) break;
      deck.cards = deck.discard;
      shuffle(deck);
    }
    var drawnCard = deck.cards.shift();
    drawnCards.unshift(drawnCard);
  }

  deck.hand = deck.hand.concat(drawnCards);

  deck.hand.sort((a, b) => {
    return a.value - b.value;
  });

}

function cheat(deck, cheatedValue) {
  var cheatedCard = deck.hand.find(card => {
    return card.value === cheatedValue;
  });
  if (!cheatedCard) {
    return cheatedCard
  }
  deck.hand = deck.hand.filter(card => {
    return card.value !== cheatedValue;
  })
  deck.discard = deck.discard.concat(cheatedCard);

  return cheatedCard;
}



function flip(deck, numflips) {
  flippedCards = []
  for (var i = 0; i < numflips; i++) {
    if (deck.cards.length <= 0) {
      if (deck.discard.length <= 0) break;
      deck.cards = deck.discard;
      deck.discard = []
      shuffle(deck);
    }
    var pulledCard = deck.cards.shift();
    flippedCards.unshift(pulledCard);
  }
  deck.discard = deck.discard.concat(flippedCards);
  return flippedCards;
}



function isFM(id) {
  return fatemaster_id === id
}


//User Functions


function createUser(userID) {
  bot.characters[userID] = {
    "might": 0,
    "grace": 0,
    "resilience": 0,
    "speed": 0,
    "charm": 0,
    "cunning": 0,
    "tenacity": 0,
    "intellect": 0,
    
    "bureaucracy":     { "aspect": "cunning", "value": 0 },
    "engineering":     { "aspect": "intellect", "value": 0 },
    "history":         { "aspect": "intellect", "value": 0 },
    "literacy":        { "aspect": "intellect", "value": 0 },
    "mathematics":     { "aspect": "intellect", "value": 0 },
    "music":           { "aspect": "charm", "value": 0 },

    "flexible":        { "aspect": "grace", "value": 0 },
    "grappling":       { "aspect": "speed", "value": 0 },
    "heavymelee":      { "aspect": "might", "value": 0 },
    "martial arts":    { "aspect": "speed", "value": 0 },
    "melee":           { "aspect": "might", "value": 0 },
    "pneumatic":       { "aspect": "might", "value": 0 },
    "pugilism":        { "aspect": "might", "value": 0 },
    
    "alchemistry":     { "aspect": "intellect", "value": 0 },
    "art":             { "aspect": "cunning", "value": 0 },
    "artefacting":     { "aspect": "intellect", "value": 0 },
    "blacksmithing":   { "aspect": "intellect", "value": 0 },
    "culinary":        { "aspect": "charm", "value": 0 },
    "explosives":      { "aspect": "intellect", "value": 0 },
    "homesteading":    { "aspect": "tenacity", "value": 0 },
    "printing":        { "aspect": "intellect", "value": 0 },
    "stitching":       { "aspect": "tenacity", "value": 0 },

    "doctor":          { "aspect": "intellect", "value": 0 },
    "forgery":         { "aspect": "cunning", "value": 0 },
    "gambling":        { "aspect": "cunning", "value": 0 },
    "husbandry":       { "aspect": "charm", "value": 0 },
    "lockpicking":     { "aspect": "grace", "value": 0 },
    "notice":          { "aspect": "cunning", "value": 0 },
    "track":           { "aspect": "cunning", "value": 0 },
    "wilderness":      { "aspect": "cunning", "value": 0 },

    "counterspelling": { "aspect": "tenacity", "value": 0 },
    "enchanting":      { "aspect": "charm", "value": 0 },
    "necromancy":      { "aspect": "charm", "value": 0 },
    "sorcery":         { "aspect": "intellect", "value": 0 },
    "prestidigiation": { "aspect": "cunning", "value": 0 },

    "archery":         { "aspect": "grace", "value": 0 },
    "heavyguns":       { "aspect": "might", "value": 0 },
    "long arms":       { "aspect": "intellect", "value": 0 },
    "pistol":          { "aspect": "grace", "value": 0 },
    "shotgun":         { "aspect": "grace", "value": 0 },
    "thrown weapons":  { "aspect": "grace", "value": 0 },

    "barter":          { "aspect": "tenacity", "value": 0 },
    "bewitch":         { "aspect": "charm", "value": 0 },
    "convince":        { "aspect": "intellect", "value": 0 },
    "deceive":         { "aspect": "cunning", "value": 0 },
    "intimidate":      { "aspect": "tenacity", "value": 0 },
    "leadership":      { "aspect": "charm", "value": 0 },
    "scrutiny":        { "aspect": "cunning", "value": 0 },

    "acrobatics":      { "aspect": "grace", "value": 0 },
    "athletics":       { "aspect": "might", "value": 0 },
    "carouse":         { "aspect": "resilience", "value": 0 },
    "centering":       { "aspect": "tenacity", "value": 0 },
    "evade":           { "aspect": "speed", "value": 0 },
    "pickpocket":      { "aspect": "speed", "value": 0 },
    "stealth":         { "aspect": "cunning", "value": 0 },
    "toughness":       { "aspect": "resilience", "value": 0 },


  }
  fs.writeFile("./characters.json", JSON.stringify(bot.characters,null,4), err => {
    if (err) throw err;
  });

}

function setAttribute(userID,attribute,value){
  if (typeof (bot.characters[userID][attribute]) === 'object' && bot.characters[userID][attribute] !== null) {
    bot.characters[userID][attribute]["value"] = value
  } else {
    bot.characters[userID][attribute] = value    
  }


  fs.writeFile("./characters.json", JSON.stringify(bot.characters,null,4), err => {
    if (err) throw err;
  });

}

// createUser("232633917876862987");
// setAttribute("232633917876862987", "might", 3);
// setAttribute("232633917876862987", "bewitch", 3);
// console.log(typeof(bot.characters["test_kit"]));


//End User Functions



bot.once("ready", () => {
  fate_deck = createDeck(suits, values);
  writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
  bot.user.setActivity('type "!help" for a list of commands');
  console.log("bot ready!");
  // console.log(bot.commands);
});

bot.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(" ");
  const commandName = args.shift().toLowerCase();
  console.log(message.author.id+": "+commandName);

  //if command name doesn't exist exit
  if (!bot.commands.has(commandName)) return;

  const command = bot.commands.get(commandName);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(
      "I had trouble following that. Please check your message or let the bot dude know."
    );
  }
});


bot.login(token);
