class Game {
  constructor(callback) {
    this.score = 0;
    this.distance = 0;
    this.savedPlayers = [];
    this.players = [];
    this.objects = [];
    this.gravity = 0.5;
    this.minimumDistanceWall = width - (width/5);
    this.maximumDistanceWall = width*2;
    this.lastWall = null;
    this.nextDistance = null;
    this.wallVelocity = 3;
    this.maximumWallVelocity = 10;
    this.callback = callback ? callback : null;
    
    this.spriteBackground = null;
    this.spritesheet = null;
  }
  
  loadSprite(sheet) {
    if(!sheet) return;
    this.spritesheet = sheet;
    this.spriteBackground = sheet.get(0, 0, 144, 256);
  }

  gameOver() {
    if(this.distance == 0) return;
    
    let players = this.savedPlayers;
    
    this.score = 0;
    this.distance = 0;
    this.lastWall = null;
    this.nextDistance = null;
    this.wallVelocity = 3;
    this.savedPlayers = [];
    this.players = [];
    this.objects = [];
    
    this.callback(players);
  }

  addPlayer(player){
    player.game = this;
    player.loadSprite(this.spritesheet);
    this.players.push(player);
  }
  
  add(object) {
    object.game = this;
    this.objects.push(object);
  }

  remove(object) {
    if(object instanceof Player){
      this.players = this.players.filter(item => item != object);
      this.savedPlayers.push(object);
    }
    
    this.objects = this.objects.filter(item => item != object);
  }

  verifyPlayers() {
    if(this.players.length < 1){
      this.gameOver();
      return;
    }
    
    for(let object of this.objects)
      for(let bound of object.bounds)
        for(let player of this.players)        
          if(player.y > height || player.bound.collides(bound))
            this.remove(player);
  }

  addWalls() {
    if(this.players.length < 1){
      this.gameOver();
      return;
    }

    this.objects.forEach(item => {
      if (item.isOutOfScreen()) {
        this.score++;
        this.remove(item);
        
        if(this.score > 0 && this.score % 10 == 0){
          this.wallVelocity += 0.5;
          if(this.wallVelocity > this.maximumWallVelocity)
            this.wallVelocity = this.maximumWallVelocity;
          
          this.objects.forEach(object => object.velocity = this.wallVelocity);
        }
      }
    });

    if (!this.lastWall || (this.nextDistance && height - this.lastWall.x >= this.nextDistance)) {
      this.lastWall = new Wall(
        random(0, height),
        random(200, 300),
        this.wallVelocity
      );
      
      if(this.spritesheet) this.lastWall.loadSprite(this.spritesheet);
      else this.lastWall.color = color(random(255),random(255),random(255));
      
      this.add(this.lastWall);
      this.nextDistance = null;
    }

    if (width - this.lastWall.x > this.minimumDistanceWall) {
      this.nextDistance = random(this.minimumDistanceWall, this.maximumDistanceWall);
    }
  }

  applyGravity() {
    for(let player of this.players){
      if (typeof player.applyGravity === 'function')
        player.applyGravity(this.gravity);
    }
  }

  update() {
    this.distance++;
    this.objects.forEach(object => object.update());
    this.players.forEach(player => player.update());
  }
  
  render() {
    this.verifyPlayers();
    this.addWalls();
    this.applyGravity();
    
    if(this.spriteBackground){
      let ratio = width/this.spriteBackground.width;
      image(this.spriteBackground, 0, 0, width, ratio*this.spriteBackground.height);
    }
    
    this.objects.forEach(object => object.render());
    this.players.forEach(player => player.render());
  }
}