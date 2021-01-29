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
bot.decks = require("./decks.json");

//bot commands start -----------------------------

bot.commands = new Discord.Collection();

const fate_shuffle_command = {
  name: "shuffle",
  description: "shuffles the twist deck (or fate deck if you're the FM)",
  execute(message, args) {
    console.log(isFM(message.author.id));
    if (isFM(message.author.id)) {
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
  },
};
bot.commands.set(fate_shuffle_command.name, fate_shuffle_command);

const fate_flip_command = {
  name: "flip",
  description: "flips a number of cards from the fate deck",
  execute(message, args) {
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
    console.log(fate_deck.cards.length);
    console.log(fate_deck.hand.length);
    console.log(fate_deck.discard.length);
  },
};
bot.commands.set(fate_flip_command.name, fate_flip_command);

const new_fate_flip_command = {
  name: "testflip",
  description: "flips a number of cards from the fate deck",
  execute(message, args) {
    const test = async (message, args) => {
      argString = args.join(" ");
      let num = Number(argString.match(/\d+/g));
      if (!num > 0) {
        num = 1;
      }
      const skillName = argString.match(/[\D]+/g).toString().trim();
      fate_deck = readDeck(0);
      const response = await fetch(
        `https://arcane-scrubland-02167.herokuapp.com/api/${message.author.id}`
      );
      const result = await response.json().catch((error) => {
        console.error(
          `Character with api_id: '${message.author.id}' Not Found.`
        );
        return {
          error: 404,
          message: `Character with api_id: '${message.author.id}' Not Found.`,
        };
      });

      let skillRank = result[skillName];
      let activeValue = 0;
      if (typeof skillRank === "object") {
        skillRank = result[skillName]["rank"];
        aspectName = result[skillName]["aspect"];
        aspectRank = result[aspectName];
        console.log("skill rank: ", skillRank, " aspect rank: ", aspectRank);
        activeValue = skillRank + aspectRank;
      } else if (typeof skillRank === "number") {
        activeValue = skillRank;
      } else {
        //do nothing
        console.log(`${skillRank} was weird.`);
      }
      flippedCards = flip(fate_deck, num).map(
        (card) => `${card.value}(${card.value + activeValue}) of ${card.suit}`
      );
      writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
      message.channel.send(
        `**${result.name}'s ${skillName} acting value:** ${activeValue} \n**Cards flipped:** ${flippedCards}`
      );
      console.log(num);
      console.log(`fate deck length: ${fate_deck.cards.length}`);
      console.log(`fate hand length: ${fate_deck.hand.length}`);
      console.log(`fate discard length: ${fate_deck.discard.length}`);
    };
    test(message, args);
  },
};
bot.commands.set(new_fate_flip_command.name, new_fate_flip_command);

const twist_initialize_command = {
  name: "create",
  description: "creates a twist deck for the player",
  execute(message, args) {
    let definining_suit = args[0] || "unknown";
    let ascendant_suit = args[1] || "unknown";
    let center_suit = args[2] || "unknown";
    let descendant_suit = args[3] || "unknown";
    console.log(args);
    twist_deck = createDeck(
      definining_suit,
      ascendant_suit,
      center_suit,
      descendant_suit
    );

    //move 3 cards to to the player's hand
    draw(twist_deck, 3);
    writeDeck(
      message.author.id,
      twist_deck.cards,
      twist_deck.hand,
      twist_deck.discard
    );
    //parse hand & discard, show in message to user
    hand = twist_deck.hand.map((card) => card.value + " of " + card.suit);
    discard = twist_deck.discard.map((card) => card.value + " of " + card.suit);
    message.author.send(
      message.author.username +
        "'s hand: " +
        hand +
        "\n" +
        message.author.username +
        "'s discard pile: " +
        discard
    );
  },
};
bot.commands.set(twist_initialize_command.name, twist_initialize_command);

const twist_show_command = {
  name: "show",
  description: "shows a player's twist hand",
  execute(message, args) {
    // if (isFM(message.author.id)) return;

    deck = readDeck(message.author.id);
    hand = deck.hand.map((card) => card.value + " of " + card.suit);
    discard = deck.discard.map((card) => card.value + " of " + card.suit);
    if (args[0] == "hand") {
      message.author.send(message.author.username + "'s hand: " + hand);
    } else if (args[0] == "discard") {
      message.author.send(
        message.author.username + "'s discard pile: " + discard
      );
    } else if (args[0] == "me") {
      if (args[1] == "the") {
        if (args[2] == "money") {
          message
            .react("💸")
            .then(message.react("💰"))
            .then(message.react("💵"));
        }
      }
    } else {
      message.author.send(
        message.author.username +
          "'s hand: " +
          hand +
          "\n" +
          message.author.username +
          "'s discard pile: " +
          discard
      );
    }
  },
};
bot.commands.set(twist_show_command.name, twist_show_command);

const twist_draw_command = {
  name: "draw",
  description: "draws cards from the player's twist deck",
  execute(message, args) {
    // if (isFM(message.author.id)) return;
    twist_deck = readDeck(message.author.id);
    num = parseInt(args[0]);
    if (!(num > 0)) {
      num = 1;
    }
    draw(twist_deck, num);
    writeDeck(
      message.author.id,
      twist_deck.cards,
      twist_deck.hand,
      twist_deck.discard
    );
    //parse hand & discard, show in message to user
    hand = twist_deck.hand.map((card) => card.value + " of " + card.suit);
    discard = twist_deck.discard.map((card) => card.value + " of " + card.suit);
    message.author.send(
      message.author.username +
        "'s hand: " +
        hand +
        "\n" +
        message.author.username +
        "'s discard pile: " +
        discard
    );
  },
};
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
    }
    message.channel.send(
      message.author.username +
        " discarded: " +
        cheatedCard.value +
        " of " +
        cheatedCard.suit
    );
    //parse hand & discard, show in message to user
    hand = twist_deck.hand.map((card) => card.value + " of " + card.suit);
    discard = twist_deck.discard.map((card) => card.value + " of " + card.suit);
    message.author.send(
      message.author.username +
        "'s hand: " +
        hand +
        "\n" +
        message.author.username +
        "'s discard pile: " +
        discard
    );
  },
};
bot.commands.set(twist_discard_command.name, twist_discard_command);

const twist_cheat_command = {
  name: "cheat",
  description:
    "cheats a card; moves it from the player's hand to the discard pile.",
  execute(message, args) {
    //card values are ints so we need to parse the argument as an int
    var value = parseInt(args[0]);
    var twist_deck = readDeck(message.author.id);
    cheatedCard = cheat(twist_deck, value);
    if (cheatedCard === undefined) {
      // message.channel.send("You don't have that card.");
      return;
    }
    message.channel.send(
      message.author.username +
        " cheated with: " +
        cheatedCard.value +
        " of " +
        cheatedCard.suit
    );
    writeDeck(
      message.author.id,
      twist_deck.cards,
      twist_deck.hand,
      twist_deck.discard
    );
    //parse hand & discard, show in message to user
    hand = twist_deck.hand.map((card) => card.value + " of " + card.suit);
    discard = twist_deck.discard.map((card) => card.value + " of " + card.suit);
    message.author.send(
      message.author.username +
        "'s hand: " +
        hand +
        "\n" +
        message.author.username +
        "'s discard pile: " +
        discard
    );
  },
};
bot.commands.set(twist_cheat_command.name, twist_cheat_command);

const share_api_key = {
  name: "api",
  description:
    "sends you your user id so that you can add it to your character sheet",
  execute(message, args) {
    message.author.send(`your user id: ${message.author.id}`);
  },
};
bot.commands.set(share_api_key.name, share_api_key);

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
    let help_message = "commands:\n";
    bot.commands.forEach((values, key) => {
      help_message += "**!" + key + ":** " + values["description"] + "\n";
    });
    message.author.send(help_message);
  },
};
bot.commands.set(help_command.name, help_command);

const get_character_command = {
  name: "review",
  description: "gets character stuff",
  execute(message, args) {
    const async_command = async (message, args) => {
      const response = await fetch(
        `https://arcane-scrubland-02167.herokuapp.com/api/${message.author.id}`
      );
      const json = await response.json().catch((error) => {
        console.error(
          `Character with api_id: '${message.author.id}' Not Found.`
        );
        return {
          error: 404,
          message: `Character with api_id: '${message.author.id}' Not Found.`,
        };
      });
      const skill = args[0];
      const result = await json;
      const skill_rank = parseInt(result[skill]["rank"]);
      const aspect_rank = parseInt(result[result[skill]["aspect"]]);
      message.channel.send(skill + ":" + (skill_rank + aspect_rank));
      console.log("done");
    };
    async_command(message, args);
  },
};
bot.commands.set(get_character_command.name, get_character_command);

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
      suit = "outcasts";
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
    deck.cards.push({ value: 0, suit: "Black Joker" });
    deck.cards.push({ value: 14, suit: "Red Joker" });
  }
  shuffle(deck);
  return deck;
}

function shuffle(deck) {
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

function writeDeck(authorID, deck, hand, discard) {
  bot.decks[authorID] = {
    cards: deck,
    hand: hand,
    discard: discard,
  };

  fs.writeFile("./decks.json", JSON.stringify(bot.decks, null, 4), (err) => {
    if (err) throw err;
  });
}

//gets WHOLE deck as object from JSON. has: deck,hand,discard
function readDeck(authorID) {
  let deck = bot.decks[authorID];
  return deck;
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
  var cheatedCard = deck.hand.find((card) => {
    return card.value === cheatedValue;
  });
  if (!cheatedCard) {
    return cheatedCard;
  }
  deck.hand = deck.hand.filter((card) => {
    return card.value !== cheatedValue;
  });
  deck.discard = deck.discard.concat(cheatedCard);

  return cheatedCard;
}

function flip(deck, numflips) {
  flippedCards = [];
  for (var i = 0; i < numflips; i++) {
    if (deck.cards.length <= 0) {
      if (deck.discard.length <= 0) break;
      deck.cards = deck.discard;
      deck.discard = [];
      shuffle(deck);
    }
    var pulledCard = deck.cards.shift();
    flippedCards.unshift(pulledCard);
  }
  deck.discard = deck.discard.concat(flippedCards);
  return flippedCards;
}

function isFM(id) {
  return fatemaster_id === id;
}

// const fetchData = async (message, args) => {
//   const response = await fetch(
//     `https://arcane-scrubland-02167.herokuapp.com/api/${message.author.id}`
//   );
//   const json = await response.json().catch((error) => {
//     console.error(`Character with api_id: '${message.author.id}' Not Found.`);
//     return {
//       error: 404,
//       message: `Character with api_id: '${message.author.id}' Not Found.`,
//     };
//   });
//   return json;
// };

bot.once("ready", () => {
  let fate_deck = readDeck(0);
  if (fate_deck) {
    console.log("bot running, deck already existed");
  } else {
    console.log("fate deck doesn't exist");
    fate_deck = createDeck(suits, values);
    writeDeck(0, fate_deck.cards, fate_deck.hand, fate_deck.discard);
    console.log("fate deck initialized");
  }
  bot.user.setActivity('type "!help" for a list of commands');
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
