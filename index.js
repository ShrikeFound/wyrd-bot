const Discord = require("discord.js");
const { prefix, token, suits, values } = require("./config.json");
bot = new Discord.Client();
const fs = require("fs");
const { type } = require("os");
bot.decks = require("./decks.json");



//bot commands start -----------------------------

bot.commands = new Discord.Collection();



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
  name: "hand",
  description: "shows a player's twist hand",
  execute(message, args) {
    deck = readDeck(message.author.id)
    hand = deck.hand.map(
      (card) => card.value + " of " + card.suit
    );
    message.channel.send("Your hand: "+hand);
  }
}
bot.commands.set(twist_show_command.name,twist_show_command)



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
      deck.cards = deck.discard;
      shuffle(deck);
    }
    var drawnCard = deck.cards.shift();
    drawnCards.unshift(drawnCard);
  }

  drawnCards.sort((a, b) => {
    return a.value - b.value;
  });

  deck.hand = deck.discard.concat(drawnCards);
  }





function flip(deck, numflips, sorted) {
  var flippedCards = [];
  for (var i = 0; i < numflips; i++) {
    if (deck.cards.length <= 0) {
      deck.cards = deck.discard;
      shuffle(deck);
    }
    var pulledCard = deck.cards.shift();
    flippedCards.unshift(pulledCard);
  }
  if (sorted == "unsorted") {
  } else {
    flippedCards.sort((a, b) => {
      return a.value - b.value;
    });
  }
  deck.discard = deck.discard.concat(flippedCards);
  return flippedCards;
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
