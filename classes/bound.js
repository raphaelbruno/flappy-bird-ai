class Bound {
  constructor(width, height){
    this.x = 0;
    this.y = 0;
    this.width = width ? width : 0;
    this.height = height ? height : 0;
  }
  
  moveTo(x, y){
    this.x = x;
    this.y = y;
  }
  
  collides(bound){
    if(bound instanceof Bound){
      var collidedX = this.x + this.width >= bound.x && this.x <= bound.x + bound.width;
      var collidedY = this.y + this.height >= bound.y && this.y <= bound.y + bound.height;
      if(collidedX && collidedY) return true;
    }
    return false;
  }
  
  render(color){
    push();
    stroke(color ? color : 'lime');
    strokeWeight(2);
    noFill();
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}