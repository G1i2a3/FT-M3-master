const commands = require('./commands');

const done = function(output){
  process.stdout.write(output);
  process.stdout.write('\nprompt > ');
}

// Output un prompt
process.stdout.write('prompt > ');
// El evento stdin 'data' se dispara cuando el user escribe una línea
// date ---> cmd = 'date' ---> commands[cmd]() ---> commands['date'] 
// echo hola mundo ---> hola mundo
// "echo hola mundo".split(' ')-->["echo", "hola", "mundo"].shift()--> "echo"-->["hola", "mundo"]

process.stdin.on('data', function (data) {
  var args = data.toString().trim().split(' '); // remueve la nueva línea
  var cmd = args.shift()
  if(commands.hasOwnProperty(cmd)) {
    //process.stdout.write(Date()); 
    commands[cmd](args, done) 
  }else {
    process.stdout.write('Command not found');
  }  
  // process.stdout.write('\nprompt > ');
});