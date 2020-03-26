class Wall {
  constructor(y, space, velocity){
    this.game = null;
    this.space = space ? space : 100;
    this.x = width;
    this.y = constrain(y ? y : random(height), (this.space/2) + 10, height - (this.space/2) - 10);
    this.width = 100;
    this.height = height;    
    this.bounds = [new Bound(this.width, this.height), new Bound(this.width, this.height)];
    this.velocity = velocity ? velocity : 1;
    
    this.topY = this.y - height - (this.space/2);
    this.bottomY = this.y + (this.space/2);
    this.color = 255;
    
    this.spriteTop = null;
    this.spriteBottom = null;
  }
  
  loadSprite(sheet) {
    this.spriteTop = sheet.get(56, 323, 26, 160);
    this.spriteBottom = sheet.get(84, 323, 26, 160);
  }
  
  update(){
    this.x -= this.velocity;
    this.bounds[0].moveTo(this.x, this.topY);
    this.bounds[1].moveTo(this.x, this.bottomY);
  }
  
  isOutOfScreen(){
    return this.x < -this.width;
  }
  
  render(){
    if (this.spriteTop && this.spriteBottom){
      image(this.spriteTop, this.x, this.topY, this.width, this.height);
      image(this.spriteBottom, this.x, this.bottomY, this.width, this.height);
    }else{
      push();
      strokeWeight(1);
      stroke(255);
      fill(this.color);
      rect(this.x, this.topY, this.width, this.height);
      rect(this.x, this.bottomY, this.width, this.height);
      pop();
    }
    //this.bounds.forEach(item => item.render('red'));
  }
}