var machineLearn = false;
var loadedBrain = false;

var generation = 1;
var lastBrain = null;
var totalPlayers = 200;
var game;
var mutatedBrains = [];
var speed;
var distance = 0;
var lastScore = 0;
var highestDistance = 0;

var trainedBrains = ['brains/brain25.json', 'brains/brain50.json', 'brains/brain75.json'];
var spriteSheet = 'sprites/spritesheet.png';

var buttonPlay;
var buttonLoadBrain;
var buttonMachineLearn;

function preload() {
  if(spriteSheet)
    spriteSheet = loadImage(spriteSheet);
  if (trainedBrains) {
    for (let i = 0; i < trainedBrains.length; i++)
      trainedBrains[i] = loadJSON(trainedBrains[i]);
  }
}

function setup() {
  createCanvas(350, 600);
  speed = createSlider(1, 10, 1);
  if (trainedBrains.length > 0)
    for (let i = 0; i < trainedBrains.length; i++)
      trainedBrains[i] = Brain.deserialize(trainedBrains[i]);

  buttonPlay = createButton('Play');
  buttonPlay.position((width - buttonPlay.width) / 2, height / 2 - (buttonPlay.height * 2));
  buttonPlay.mousePressed(() => {
    machineLearn = false;
    loadedBrain = false;
    generation = 1;
    start();
  });

  buttonLoadBrain = createButton('Load Trained Brain');
  buttonLoadBrain.position((width - buttonLoadBrain.width) / 2, height / 2);
  buttonLoadBrain.mousePressed(() => {
    machineLearn = false;
    loadedBrain = true;

    generation = "";
    for (let trainedBrain of trainedBrains)
      generation += trainedBrain.generation + " ";


    start();
  });

  buttonMachineLearn = createButton('Machine Learn');
  buttonMachineLearn.position((width - buttonMachineLearn.width) / 2, height / 2 + (buttonMachineLearn.height * 2));
  buttonMachineLearn.mousePressed(() => {
    machineLearn = true;
    loadedBrain = false;
    generation = 1;
    start();
  });

  tf.setBackend('cpu');
  game = new Game(players => {
    if (machineLearn) {
      nextGeneration(players);
      return;
    }

    buttonPlay.show();
    buttonLoadBrain.show();
    buttonMachineLearn.show();
  });
  game.loadSprite(spriteSheet);

}

function start() {
  if (machineLearn) {
    if (mutatedBrains.length > 0) {
      for (let brain of mutatedBrains) {
        let player = new Player(brain);
        player.moveTo(50, height / 2);
        game.addPlayer(player);
      }
    } else {
      for (let i = 0; i < totalPlayers; i++) {
        let player = new Player(new Brain(5, 8, 2));
        player.moveTo(50, height / 2);
        game.addPlayer(player);
      }
    }
  } else {
    if (loadedBrain) {
      for (let i = 0; i < trainedBrains.length; i++) {
        let player = new Player(trainedBrains[i]);
        player.moveTo(50, height / 2);
        player.setSpriteIndex(i);
        game.addPlayer(player);
      }
    } else {
      let player = new Player();
      player.moveTo(50, height / 2);
      game.addPlayer(player);
    }
  }

  buttonPlay.hide();
  buttonLoadBrain.hide();
  buttonMachineLearn.hide();
}

function draw() {
  if (game.players.length > 0) {
    for (let n = 0; n < speed.value(); n++) {
      game.update();
      lastScore = game.score;
      distance = game.distance;
      if (distance > highestDistance) highestDistance = distance;
    }
  }

  background(0);
  game.render()

  strokeWeight(5);
  stroke(50, 150, 150);
  fill(255);
  textSize(20);
  
  if (game.players.length < 1) {
    text('Jump: [spacebar] or [click]', 10, height - 60);
    text('Quit: [esc]', 10, height - 40);
    text('Save Brain: [s]', 10, height - 20);
  }

  text('Highest Distance: ' + highestDistance, 10, 20);
  text('Generation: ' + generation, 10, 40);
  text('Score: ' + lastScore, 10, 60);

}

// Input Control
function keyPressed() {
  if (keyCode === ESCAPE) {
    machineLearn = false;
    loadedBrain = false;
    game.gameOver();
  }
  if (key == ' ') jump();
  if (key.toLowerCase() == 's') {
    let brain = game.players[0].brain; //.serialize();
    saveJSON(brain, 'brain.json');
  }
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    jump();
  }
}

function jump() {
  if (game.players.length > 0 && !machineLearn && !loadedBrain)
    game.players[0].jump();
}



// Next Generation
function nextGeneration(players) {
  generation++;

  function calculateFitness(players) {
    let totalDistance = 0;
    for (let player of players) totalDistance += player.distance;
    for (let player of players) player.fitness = player.distance / totalDistance;
  }

  function pickOne(players) {
    let index = 0;
    let r = random(1);
    while (r > 0) {
      r = r - players[index].fitness;
      index++;
    }
    index--;

    return players[index];
  }


  calculateFitness(players);

  mutatedBrains = [];
  for (let i = 0; i < totalPlayers; i++) {
    let player = pickOne(players);
    let brain = player.brain.clone();
    brain.mutate(0.1);
    brain.generation = generation;
    mutatedBrains.push(brain);
  }

  for (let player of players) player.brain.dispose();

  start();

}
