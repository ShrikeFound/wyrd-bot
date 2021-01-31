const Discord = require("discord.js");
const {
  prefix,
  token,
  suits,
  values,
  fatemaster_id,
} = require("./config.json");
bot = new Discord.Client();
const fs = require("fs");
const { type } = require("os");
const { Console } = require("console");
const fetch = require("node-fetch");


//adding firebase
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lucius-bot-default-rtdb.firebaseio.com/"
});

let db = admin.database();
let usersRef = db.ref("users");

//bot commands start -----------------------------

bot.commands = new Discord.Collection();

const fate_deck_initialize_command = {
  name: "fate_initialize",
  description: "creates a new fate deck",
  execute(message, args) {
    initializeFateDeck();
  }
}
bot.commands.set(fate_deck_initialize_command.name,fate_deck_initialize_command)

const help_command = {
  name: "help",
  description: "lists commands and other stuff",
  execute(message, args) {
    let help_message = "commands:\n";
    bot.commands.forEach((values, key) => {
      help_message += "**!" + key + ":** " + values["description"] + "\n";
    });
    message.author.send(help_message);
  },
};
bot.commands.set(help_command.name, help_command);


//firebase functions --------------------------------

const findSuit = (string) => {
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
      suit = "outcasts";
      break;
  }
  return suit;
}

const createDeck = (suits, values, center, descendant) => {
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
    deck.cards.push({ value: 0, suit: "Black Joker" })
    deck.cards.push({value: 14, suit: "Red Joker" })
  }
  shuffle(deck);
  return deck;
}

const shuffle = (deck) => {
  deck.cards = deck.cards.concat(deck.discard);
  deck.cards = deck.cards.concat(deck.hand);
  deck.discard = [];
  deck.hand = [];
  for (var i = 0; i < 1000; i++) {
    var randomLocation = Math.floor(Math.random() * deck.cards.length);
    var temp = deck.cards[0];
    deck.cards[0] = deck.cards[randomLocation];
    deck.cards[randomLocation] = temp;
  }
  console.log(deck.cards.length);
}



const flip = async (authorID, numflips) => {
  console.log(`flipping! ${authorID}`)
  let deck;
  let deckRef = usersRef.child(authorID)
  
  deckRef.on("value", async (snapshot) => {
    console.log(snapshot.val());
    deck = await snapshot.val();
  }, async (errorObject) => {
      console.log("error! " + errorObject.code);
  })
  console.log("decK: "+ deck);
  
  // for (var i = 0; i < numflips; i++) {
  //   if (deck.cards.length <= 0) {
  //     if (deck.discard.length <= 0) break;
  //     deck.cards = deck.discard;
  //     deck.discard = [];
  //     shuffle(deck);
  //   }
  //   var pulledCard = deck.cards.shift();
  //   flippedCards.unshift(pulledCard);
  // }
  // deck.discard = deck.discard.concat(flippedCards);
  // return flippedCards;
  
}




//end firebase functions --------------------------------



const initializeFateDeck = async () => {
  let fateDeckValues = createDeck(suits,values);
  usersRef.child("fatedeck").set({
    cards: fateDeckValues.cards,
    hand: fateDeckValues.hand,
    discard: fateDeckValues.discard
  });
}


bot.once("ready", async () => {
  bot.user.setActivity('type "!help" for a list of commands');
  console.log("ready!");
  flip("fatedeck",1)
});

bot.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(" ");
  const commandName = args.shift().toLowerCase();
  console.log(message.author.id + ": " + commandName);

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
