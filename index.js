const Discord = require("discord.js");
const { prefix, token, suits, values } = require("./config.json");
bot = new Discord.Client();
const fs = require("fs");
const { type } = require("os");
bot.twist_decks = require("./TwistDecks.json");
//
//bot commands start
//
bot.commands = new Discord.Collection();

const shuffle_command = {
  name: "shuffle",
  description: "shuffles the deck a bit.",
  execute(message, args) {
    shuffle(fate_deck);
    message.channel.send("Fate deck shuffled.");
  },
};
bot.commands.set(shuffle_command.name, shuffle_command);

const flip_command = {
  name: "flip",
  description: "flips x numbers of cards",
  execute(message, args) {
    num = args[0];
    sorted = args[1];
    if (!num > 0) {
      num = 1;
    }
    flipped_cards = flip(fate_deck, num, sorted);
    faces = [];
    flipped_cards.forEach((card) => {
      faces.push(`${card.value} of ${card.suit}`);
    });
    message.channel.send("Cards flipped: " + faces.join(","));
  },
};
bot.commands.set(flip_command.name, flip_command);

const create_twist_command = {
  name: "create",
  description: "shuffles the deck a bit.",
  execute(message, args) {
    // message.channel.send("creating...");
    if (args.length <= 3) {
      message.channel.send(
        "please enter 4 suits (you entered '" + args + " ')"
      );
      return;
    }

    deck = createDeck(args[0], args[1], args[2], args[3]);
    shuffle(deck);
    bot.twist_decks[message.author.id] = {
      deck: deck.cards,
      hand: deck.hand,
      discard: deck.discard,
    };
    fs.writeFile(
      "./TwistDecks.json",
      JSON.stringify(bot.twist_decks, null, 4),
      (err) => {
        if (err) throw err;
        message.channel.send("created. use !show to view your deck.");
      }
    );
  },
};
bot.commands.set(create_twist_command.name, create_twist_command);

const show_twist_command = {
  name: "show",
  description: "shows the deck",
  execute(message, args) {
    deck = bot.twist_decks[message.author.id].deck.map(
      (card) => card.value + " of " + card.suit
    );
    message.author.send(deck);
  },
};
bot.commands.set(show_twist_command.name, show_twist_command);

const cheat_twist_command = {
  name: "cheat",
  description: "shows the deck",
  execute(message, args) {
    cheated_value = args[0];
    twist_deck = bot.twist_decks[message.author.id].deck;
    results = drawCard(twist_deck, cheated_value);
    if (results == false) {
      message.channel.send("couldn't find that card");
      return;
    }
    let cheated_card = results.cheated_card[0],
      remaining_deck = results.remaining_deck;

    bot.twist_decks[message.author.id].deck = remaining_deck;
    discard = bot.twist_decks[message.author.id].discard;
    fs.writeFile(
      "./TwistDecks.json",
      JSON.stringify(bot.twist_decks, null, 4),
      (err) => {
        if (err) throw err;
        message.channel.send("created. use !show to view your deck.");
      }
    );

    message.channel.send(
      "cheating with a " + cheated_card.value + " of " + cheated_card.suit
    );
  },
};
bot.commands.set(cheat_twist_command.name, cheat_twist_command);

//
//bot commands end
//

//function for shuffling decks
function shuffle(deck) {
  for (var i = 0; i < 1000; i++) {
    var randomLocation = Math.floor(Math.random() * deck.cards.length);
    var temp = deck.cards[0];
    deck.cards[0] = deck.cards[randomLocation];
    deck.cards[randomLocation] = temp;
  }
}

//function for flipping cards
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

//function for creating fate or twist deck
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

  return deck;
}

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

function drawCard(deck, value) {
  cheated_card = deck.filter((card) => card.value == value);
  remaining_deck = deck.filter((card) => card.value != value);
  if (cheated_card.length <= 0) {
    return false;
  }
  return {
    cheated_card,
    remaining_deck,
  };
}

bot.once("ready", () => {
  fate_deck = createDeck(suits, values);
  // console.log(fate_deck);
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
