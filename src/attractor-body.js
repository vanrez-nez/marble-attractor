import * as THREE from "three";

export default class AttractorBody {
  constructor() {
    (this.mass = 1), (this.friction = 0.05);
    this.radius = 0.1;
    this.position = new THREE.Spherical();
    this.velocity = new THREE.Spherical();
    this.acceleration = new THREE.Spherical();
  }

  addSphericalTo(s1, s2) {
    s1.radius += s2.radius;
    s1.theta += s2.theta;
    s1.phi += s2.phi;
  }

  update(delta) {
    const { velocity: vel, position: pos, acceleration: acc, friction } = this;
    this.addSphericalTo(vel, acc);
    acc.set(0, 0, 0);

    vel.radius *= 1 - friction;
    vel.theta *= 1 - friction;
    vel.phi *= 1 - friction;

    this.addSphericalTo(pos, vel);
  }
}
