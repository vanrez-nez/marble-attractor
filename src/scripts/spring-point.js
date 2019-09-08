
const CachedV3 = new THREE.Vector3();

export default class SpringPoint {
    constructor() {
        this.friction = 0.85;
        this.radius = 10;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
    }

    applyForce(x, y) {
        const dst = CachedV3.set(0, 0, 0).sub(this.position);
        const force = dst.multiply(this.friction);
        this.velocity.add(force);
    }

    update(delta) {
        this.velocity.multiplyScalar(this.friction);
        this.position.add(this.velocity)
    }
}