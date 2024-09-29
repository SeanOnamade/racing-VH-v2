class MassCategory {
    static Light = 'Light';
    static Medium = 'Medium';
    static Heavy = 'Heavy';
}

class TireType {
    static Rain = 'Rain';
    static Slick = 'Slick';
}

class SurfaceType {
    static Asphalt = 'Asphalt';
    static Gravel = 'Gravel';
    static Ice = 'Ice';
}

class Car {
    constructor(mCat, tType, startX, startY) {
        this.positionX = startX;
        this.positionY = startY;
        this.massCategory = mCat;
        this.tireType = tType;
        this.surfaceType = SurfaceType.Asphalt;
        this.angle = 0.0;
        this.velocity = 0.0;
        this.acceleration = 0.0;
        this.tireTemperature = 20.0;
        this.tireGrip = null;
        this.baseTireGrip = null;
        this.minTireGrip = 0.5;
        this.gripDecayRate = 0.001;
        this.traction = 1.0;

        this.setMassCategory(mCat);
        this.setTireType(tType);

        if (mCat === MassCategory.Light && tType === TireType.Slick) {
            this.maxVelocity = 200.0;
        } else if (mCat === MassCategory.Medium && tType === TireType.Slick) {
            this.maxVelocity = 180.0;
        } else if (mCat === MassCategory.Heavy && tType === TireType.Slick) {
            this.maxVelocity = 160.0;
        } else if (tType === TireType.Rain) {
            this.maxVelocity = 140.0;
        } else {
            this.maxVelocity = 180.0;
        }

        this.wheelbase = 2.5;
        this.setCorneringStiffness();

        this.steeringAngle = 0.0;
        this.maxSteeringAngle = this.degToRad(45);
        this.steeringSpeed = this.degToRad(60);
    }

    setMassCategory(mCat) {
        if (mCat === MassCategory.Light) {
            this.mass = 1800.0 * 0.453592; // Convert to kg
        } else if (mCat === MassCategory.Medium) {
            this.mass = 2800.0 * 0.453592;
        } else if (mCat === MassCategory.Heavy) {
            this.mass = 3800.0 * 0.453592;
        }
    }

    setTireType(tType) {
        if (tType === TireType.Rain) {
            this.baseTireGrip = 0.7;
        } else if (tType === TireType.Slick) {
            this.baseTireGrip = 1.0;
        }
        this.tireGrip = this.baseTireGrip;
    }

    setCorneringStiffness() {
        let baseStiffness;
        if (this.tireType === TireType.Slick) {
            baseStiffness = 150000;
        } else if (this.tireType === TireType.Rain) {
            baseStiffness = 100000;
        }

        this.Cf = baseStiffness * 0.6;
        this.Cr = baseStiffness * 0.4;
    }

    calculateUndersteerGradient() {
        const Wf = this.mass * 0.6;
        const Wr = this.mass * 0.4;
        const K = (this.wheelbase / this.mass) * ((Wf / this.Cf) - (Wr / this.Cr));
        return K;
    }

    applyThrottle(throttle, deltaTime) {
        const maxAcceleration = 30.0;
        let acceleration = throttle * maxAcceleration * this.traction * (1 - this.velocity / this.maxVelocity);
        if (acceleration < 0) acceleration = 0;
        this.acceleration = acceleration;
        this.velocity += this.acceleration * deltaTime;
        if (this.velocity > this.maxVelocity) this.velocity = this.maxVelocity;

        console.log(`Throttle: ${throttle}, Acceleration: ${this.acceleration}, Velocity: ${this.velocity}, Position: (${this.positionX}, ${this.positionY})`);
    }

    applyBrake(brakeForce, deltaTime) {
        const maxDeceleration = 50.0;
        const deceleration = brakeForce * maxDeceleration * this.traction;
        this.acceleration = -deceleration;
        this.velocity += this.acceleration * deltaTime;
        if (this.velocity < 0) {
            this.velocity = 0.0;
            this.acceleration = 0.0;
        }

        console.log(`Brake: ${brakeForce}, Deceleration: ${this.acceleration}, Velocity: ${this.velocity}, Position: (${this.positionX}, ${this.positionY})`);
    }

    updateSteering(steeringInput, deltaTime) {
        this.steeringAngle += steeringInput * this.steeringSpeed * deltaTime;
        if (this.steeringAngle > this.maxSteeringAngle) {
            this.steeringAngle = this.maxSteeringAngle;
        } else if (this.steeringAngle < -this.maxSteeringAngle) {
            this.steeringAngle = -this.maxSteeringAngle;
        }

        console.log(`Steering input: ${steeringInput}, Steering angle (deg): ${this.radToDeg(this.steeringAngle)}`);
    }

    updatePosition(deltaTime) {
        const rollingResistance = 12.0;
        const dragCoefficient = 0.4257;
        const airDensity = 1.225;
        const frontalArea = 2.2;
        const dragForce = 0.5 * dragCoefficient * airDensity * frontalArea * this.velocity ** 2;

        const totalResistance = (rollingResistance + dragForce) / this.mass;
        this.velocity -= totalResistance * deltaTime;
        if (this.velocity < 0) this.velocity = 0;

        if (this.velocity > 0) {
            const K = this.calculateUndersteerGradient();
            let adjustedSteeringAngle = this.steeringAngle * (1 + K);
            const speedFactor = Math.max(0.5, 1 - (this.velocity / this.maxVelocity) * 0.5);
            const steeringEffectiveness = 0.9 * speedFactor;
            adjustedSteeringAngle *= steeringEffectiveness;

            this.updateTireGrip();
            this.traction = this.tireGrip;

            const turningRadius = adjustedSteeringAngle !== 0 ? this.wheelbase / Math.tan(adjustedSteeringAngle) : Infinity;
            const angularVelocity = this.velocity / turningRadius;
            this.angle += angularVelocity * deltaTime;
            this.angle = this.angle % (2 * Math.PI);

            const forwardX = this.velocity * Math.cos(this.angle) * deltaTime;
            const forwardY = this.velocity * Math.sin(this.angle) * deltaTime;
            this.positionX += forwardX;
            this.positionY += forwardY;

            this.updateTireTemperature(deltaTime);
            this.applyTireStress(this.steeringAngle, this.velocity, deltaTime);
        }

        console.log(`Updated position: (${this.positionX}, ${this.positionY}), Velocity: ${this.velocity}, Steering angle: ${this.radToDeg(this.steeringAngle)}`);
    }

    updateTireTemperature(deltaTime) {
        const tempIncrease = (Math.abs(this.steeringAngle) + 0.1) * this.velocity * 0.05 * deltaTime;
        const tempDecrease = (this.tireTemperature - 20.0) * 0.1 * deltaTime;
        this.tireTemperature += tempIncrease - tempDecrease;
        if (this.tireTemperature < 20.0) {
            this.tireTemperature = 20.0;
        }
    }

    updateTireGrip() {
        const optimalTemp = 90.0;
        const tempDifference = Math.abs(this.tireTemperature - optimalTemp);
        const temperatureEffect = Math.max(0.5, 1 - (tempDifference / 100));

        const speedEffect = Math.max(0.7, 1 - (this.velocity / this.maxVelocity) * 0.3);
        const steeringEffect = Math.max(0.7, 1 - (Math.abs(this.steeringAngle) / this.maxSteeringAngle) * 0.3);

        this.tireGrip = this.baseTireGrip * temperatureEffect * speedEffect * steeringEffect;
        if (this.tireGrip < this.minTireGrip) {
            this.tireGrip = this.minTireGrip;
        }

        console.log(`Tire temperature: ${this.tireTemperature}, Tire grip: ${this.tireGrip}`);
    }

    applyTireStress(steeringAngle, velocity, deltaTime) {
        const stressFactor = (Math.abs(steeringAngle) + 0.1) * velocity;
        const decayAmount = stressFactor * this.gripDecayRate * deltaTime;
        this.tireGrip -= decayAmount;
        if (this.tireGrip < this.minTireGrip) {
            this.tireGrip = this.minTireGrip;
        }
    }

    // Utility methods for angle conversion
    degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    getPositionX() {
        return this.positionX;
    }

    getPositionY() {
        return this.positionY;
    }

    getVelocity() {
        return this.velocity;
    }

    getAcceleration() {
        return this.acceleration;
    }

    getTireGrip() {
        return this.tireGrip;
    }

    getTireTemperature() {
        return this.tireTemperature;
    }

    getSteeringAngleDegrees() {
        return this.radToDeg(this.steeringAngle);
    }
}

export { Car, MassCategory, TireType, SurfaceType };
