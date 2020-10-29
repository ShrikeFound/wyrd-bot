module.exports = {
  name: 'create',
  description: 'command for creating a deck',
  execute(message, args) {
    message.channel.send('creating!');
  }
}