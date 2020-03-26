class Player {
  constructor(brain) {
    this.game = null;
    this.x = 0;
    this.y = 0;
    this.width = 50;
    this.height = 50;
    this.bound = new Bound(this.width, this.height);
    this.velocity = 0;
    this.jumpForce = 10;
    this.maximumVelocity = 20;

    this.distance = 0;
    this.fitness = 0;

    this.spriteIndex = 0;
    this.sprite = null;

    if (brain) this.brain = brain;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  
  setSpriteIndex(index){
    this.spriteIndex = index % 3;
  }
  
  loadSprite(sheet) {
    if(!sheet) return;
    this.sprite = [
      [sheet.get(2, 489, 17, 17), sheet.get(30, 489, 17, 17), sheet.get(58, 489, 17, 17)],
      [sheet.get(87, 489, 17, 17), sheet.get(115, 327, 17, 17), sheet.get(115, 353, 17, 17)],
      [sheet.get(115, 379, 17, 17), sheet.get(115, 405, 17, 17), sheet.get(115, 431, 17, 17)],
    ];
  }

  applyGravity(gravity) {
    if (abs(this.velocity + gravity) > this.maximumVelocity) return;
    this.velocity += gravity;
  }

  jump() {
    if (this.y > 0)
      this.velocity = -this.jumpForce;
  }

  think() {
    if (!this.game || !this.brain) return;

    let closest = null;
    let closestDistance = Infinity;
    for (let object of this.game.objects) {
      let distance = (object.x + object.width) - this.x;
      if (distance < closestDistance && distance > 0) {
        closest = object;
        closestDistance = distance;
      }
    }
    if (!closest) return;

    let inputs = [
      this.y / height,
      (closest.topY + closest.height) / height,
      closest.bottomY / height,
      closest.x / width,
      closest.velocity / this.game.maximumWallVelocity
    ];

    let output = this.brain.predict(inputs);

    if (output[0] > output[1]) {
      this.jump();
    }
  }

  update() {
    this.think();

    this.y += this.velocity;
    this.bound.moveTo(this.x, this.y);

    this.distance++;
  }

  render() {
    if (this.sprite){
      image(this.sprite[this.spriteIndex][(floor(frameCount*0.25)%this.sprite.length)], this.x, this.y, this.width, this.height);
    }else{
      push();
      strokeWeight(1);
      stroke(255);
      fill(255, 50);
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
    //this.bound.render();
  }
}