class Car2 {
  constructor(position, velocity, friction, canvasWidth, canvasHeight) {
    this.position = { x: position.x, y: position.y };
    this.velocity = { x: velocity.x, y: velocity.y };
    this.acceleration = { x: 0, y: 0 };
    this.friction = friction;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  update2(input) {

    this.acceleration.x = input.x;
    this.acceleration.y = input.y;

    

    // Apply friction
    const velocityLength = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (velocityLength > 0) {
      const frictionForce = {
        x: this.velocity.x / velocityLength * -this.friction,
        y: this.velocity.y / velocityLength * -this.friction
      };
      this.acceleration.x += frictionForce.x;
      this.acceleration.y += frictionForce.y;
    }

    // Update velocity and position
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Screen wrap-around logic
    //if (this.position.x < 0) this.position.x = this.canvasWidth;
    //else if (this.position.x > this.canvasWidth) this.position.x = 0;

    //if (this.position.y < 0) this.position.y = this.canvasHeight;
    //else if (this.position.y > this.canvasHeight) this.position.y = 0;
  }

  update(mousePos) {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    // Calculate direction vector towards the mouse
    const directionVector = {
      x: mousePos.x - centerX,
      y: mousePos.y - centerY
    };

    // Normalize direction vector and set acceleration
    const length = Math.sqrt(directionVector.x ** 2 + directionVector.y ** 2);
    if (length > 0) {
      this.acceleration.x = directionVector.x / length;
      this.acceleration.y = directionVector.y / length;
    }

    

    // Apply friction
    const velocityLength = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (velocityLength > 0) {
      const frictionForce = {
        x: this.velocity.x / velocityLength * -this.friction,
        y: this.velocity.y / velocityLength * -this.friction
      };
      this.acceleration.x += frictionForce.x;
      this.acceleration.y += frictionForce.y;
    }

    // Update velocity and position
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Screen wrap-around logic
    if (this.position.x < 0) this.position.x = this.canvasWidth;
    else if (this.position.x > this.canvasWidth) this.position.x = 0;

    if (this.position.y < 0) this.position.y = this.canvasHeight;
    else if (this.position.y > this.canvasHeight) this.position.y = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }
}

export default Car2;
