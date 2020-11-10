const Discord = require("discord.js");
const { prefix, token, suits, values, fatemaster_id } = require("./config.json");
bot = new Discord.Client();
const fs = require("fs");
const { type } = require("os");
bot.decks = require("./decks.json");


//bot commands start -----------------------------

bot.commands = new Discord.Collection();


const fate_shuffle_command = {
  name: "shuffle",
  description: "shuffles the fate deck",
  execute(message, args) {
    if (isFM(message.author.id)){
      fate_deck = readDeck(0);
      shuffle(fate_deck);
      writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
    }
  }
}
bot.commands.set(fate_shuffle_command.name, fate_shuffle_command);


const fate_flip_command = {
  name: "flip",
  description: "flips a number of cards from the fate deck",
  execute(message,args) {
    num = args[0];
    if (!num > 0) {
      num = 1;
    }
    fate_deck = readDeck(0);


     flippedCards = flip(fate_deck, num).map(
      (card) => card.value + " of " + card.suit
    );

    writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
    message.channel.send("cards flipped: " + flippedCards);
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
      message.channel.send(message.author.username+ "'s hand: "+hand);      
    } else if (args[0] == "discard") {
      message.channel.send(message.author.username+ "'s discard pile: "+discard);      
    } else if (args[0] == "me") {
      if (args[1] == "the") {
        if (args[2] == "money") {
          message.react("💸").then(message.react("💰")).then(message.react("💵")) 
                  
       } 
      }
    } else {
      message.channel.send(message.author.username+ "'s hand: "+hand +"\n"+message.author.username+"'s discard pile: "+discard);      
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
      message.channel.send("You don't have that card.");
      return;
    };
    message.channel.send("discarded: "+cheatedCard.value+" of "+cheatedCard.suit);
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
      message.channel.send("You don't have that card.");
      return;
    };
    message.channel.send("cheated with: "+cheatedCard.value+" of "+cheatedCard.suit);
    writeDeck(message.author.id,twist_deck.cards,twist_deck.hand,twist_deck.discard)
  }
}
bot.commands.set(twist_cheat_command.name,twist_cheat_command)




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




bot.once("ready", () => {
  fate_deck = createDeck(suits, values);
  writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
  console.log("bot ready!");
});

bot.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
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
    message.reply(
      "I had trouble following that. Please check your message or let the bot dude know."
    );
  }
});


bot.login(token);
