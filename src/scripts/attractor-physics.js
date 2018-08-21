import AttractorBody from "./attractor-body";

const ATTRACTOR_DEFAULTS = {
  radius: 0.25,
  gravity: -0.1,
  friction: 1
};

export default class AttractorPhysics {
  constructor(opts) {
    this.opts = { ...ATTRACTOR_DEFAULTS, ...opts };
    this.bodies = [];
  }

  addBody() {
    const body = new AttractorBody();
    const rndPI = Math.random() * Math.PI;
    body.position.set(0.5, rndPI, rndPI);
    body.radius = Math.random() * 0.01 + 0.01;
    const rndAcc = Math.random() * 2;
    body.velocity.set(rndAcc, Math.random() * 2, Math.random() * 2);
    this.bodies.push(body);
  }

  constrainBody(body) {
    const { radius } = this.opts;
    if (body.position.radius < radius) {
      body.position.radius = radius + body.radius;
    }
  }

  update(delta) {
    const { opts, bodies } = this;
    const { radius, gravity } = opts;

    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      // Apply Gravity
      body.velocity.radius += body.mass * gravity;
      body.update(delta);
      this.constrainBody(body);
    }
  }
}
