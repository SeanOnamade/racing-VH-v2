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

/**
 * @definition Car
 * @params mCat, tType, startX, startY
 * @returns Car object
 * Car class representing a vehicle with properties for mass category, tire type, position, and various physics-related attributes.
 */
class Car {
    constructor(mCat, tType, startX, startY) {
        this.startX = startX;
        this.startY = startY;
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
            this.maxVelocity = 500.0;
        } else if (mCat === MassCategory.Medium && tType === TireType.Slick) {
            this.maxVelocity = 480.0;
        } else if (mCat === MassCategory.Heavy && tType === TireType.Slick) {
            this.maxVelocity = 460.0;
        } else if (tType === TireType.Rain) {
            this.maxVelocity = 440.0;
        } else {
            this.maxVelocity = 480.0;
        }

        this.wheelbase = 2.5;
        this.setCorneringStiffness();

        this.steeringAngle = 0.0;
        this.maxSteeringAngle = this.degToRad(45);
        this.steeringSpeed = this.degToRad(60);
    }

    /**
     * @definition setMassCategory
     * @params mCat
     * @returns None
     * Sets the mass of the car based on its mass category.
     */
    setMassCategory(mCat) {
        if (mCat === MassCategory.Light) {
            this.mass = 1800.0 * 0.453592;
        } else if (mCat === MassCategory.Medium) {
            this.mass = 2800.0 * 0.453592;
        } else if (mCat === MassCategory.Heavy) {
            this.mass = 3800.0 * 0.453592;
        }
    }

    /**
     * @definition setTireType
     * @params tType
     * @returns None
     * Sets the base tire grip based on the tire type.
     */
    setTireType(tType) {
        if (tType === TireType.Rain) {
            this.baseTireGrip = 0.7;
        } else if (tType === TireType.Slick) {
            this.baseTireGrip = 1.0;
        }
        this.tireGrip = this.baseTireGrip;
    }

    /**
     * @definition setCorneringStiffness
     * @params None
     * @returns None
     * Sets the cornering stiffness values for the front and rear tires based on tire type.
     */
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

    /**
     * @definition calculateUndersteerGradient
     * @params None
     * @returns Number
     * Calculates and returns the understeer gradient based on car weight distribution and cornering stiffness.
     */
    calculateUndersteerGradient() {
        const Wf = this.mass * 0.6;
        const Wr = this.mass * 0.4;
        const K = (this.wheelbase / this.mass) * ((Wf / this.Cf) - (Wr / this.Cr));
        return K;
    }

    /**
     * @definition applyThrottle
     * @params throttle, deltaTime
     * @returns None
     * Applies throttle to the car, increasing its velocity.
     */
    applyThrottle(throttle, deltaTime) {
        const maxAcceleration = 90.0;
        let acceleration = throttle * maxAcceleration * this.traction * (1 - this.velocity / this.maxVelocity);
        if (acceleration < 0) acceleration = 0;
        this.acceleration = acceleration;
        this.velocity += this.acceleration * deltaTime;
        if (this.velocity > this.maxVelocity) this.velocity = this.maxVelocity;
    }

    /**
     * @definition applyBrake
     * @params brakeForce, deltaTime
     * @returns None
     * Applies brakes to the car, reducing its velocity.
     */
    applyBrake(brakeForce, deltaTime) {
        const maxDeceleration = 60.0;
        const deceleration = brakeForce * maxDeceleration * this.traction;
        this.acceleration = -deceleration;
        this.velocity += this.acceleration * deltaTime;
        if (this.velocity < 0) {
            this.velocity = 0.0;
            this.acceleration = 0.0;
        }
    }

    /**
     * @definition updateSteering
     * @params steeringInput, deltaTime
     * @returns None
     * Updates the steering angle of the car based on steering input.
     */
    updateSteering(steeringInput, deltaTime) {
        this.steeringAngle += steeringInput * this.steeringSpeed * deltaTime;
        if (this.steeringAngle > this.maxSteeringAngle) {
            this.steeringAngle = this.maxSteeringAngle;
        } else if (this.steeringAngle < -this.maxSteeringAngle) {
            this.steeringAngle = -this.maxSteeringAngle;
        }
    }

    /**
     * @definition updatePosition
     * @params deltaTime
     * @returns None
     * Updates the car's position based on its velocity and steering angle.
     */
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
    }

    /**
     * @definition updateTireTemperature
     * @params deltaTime
     * @returns None
     * Updates the tire temperature based on steering angle and velocity.
     */
    updateTireTemperature(deltaTime) {
        const tempIncrease = (Math.abs(this.steeringAngle) + 0.1) * this.velocity * 0.05 * deltaTime;
        const tempDecrease = (this.tireTemperature - 20.0) * 0.1 * deltaTime;
        this.tireTemperature += tempIncrease - tempDecrease;
        if (this.tireTemperature < 20.0) {
            this.tireTemperature = 20.0;
        }
    }

    /**
     * @definition updateTireGrip
     * @params None
     * @returns None
     * Updates the tire grip based on temperature, speed, and steering angle.
     */
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
    }

    /**
     * @definition applyTireStress
     * @params steeringAngle, velocity, deltaTime
     * @returns None
     * Applies stress to the tires based on steering angle and velocity, decaying the tire grip.
     */
    applyTireStress(steeringAngle, velocity, deltaTime) {
        const stressFactor = (Math.abs(steeringAngle) + 0.1) * velocity;
        const decayAmount = stressFactor * this.gripDecayRate * deltaTime;
        this.tireGrip -= decayAmount;
        if (this.tireGrip < this.minTireGrip) {
            this.tireGrip = this.minTireGrip;
        }
    }

    /**
     * @definition resetState
     * @params None
     * @returns None
     * Resets the car to its initial starting position and orientation.
     */
    resetState() {
        this.positionX = this.startX;
        this.positionY = this.startY;
        this.velocity = 0.0;
        this.acceleration = 0.0;
        this.steeringAngle = 0.0;
        this.angle = 0.0;
    }

    /**
     * @definition degToRad
     * @params deg
     * @returns Number
     * Converts degrees to radians.
     */
    degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * @definition radToDeg
     * @params rad
     * @returns Number
     * Converts radians to degrees.
     */
    radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    /**
     * @definition getPositionX
     * @params None
     * @returns Number
     * Returns the car's X position.
     */
    getPositionX() {
        return this.positionX;
    }

    /**
     * @definition getPositionY
     * @params None
     * @returns Number
     * Returns the car's Y position.
     */
    getPositionY() {
        return this.positionY;
    }

    /**
     * @definition getVelocity
     * @params None
     * @returns Number
     * Returns the car's velocity.
     */
    getVelocity() {
        return this.velocity;
    }

    /**
     * @definition getAcceleration
     * @params None
     * @returns Number
     * Returns the car's acceleration.
     */
    getAcceleration() {
        return this.acceleration;
    }

    /**
     * @definition getTireGrip
     * @params None
     * @returns Number
     * Returns the car's tire grip.
     */
    getTireGrip() {
        return this.tireGrip;
    }

    /**
     * @definition getTireTemperature
     * @params None
     * @returns Number
     * Returns the car's tire temperature.
     */
    getTireTemperature() {
        return this.tireTemperature;
    }

    /**
     * @definition getSteeringAngleDegrees
     * @params None
     * @returns Number
     * Returns the steering angle in degrees.
     */
    getSteeringAngleDegrees() {
        return this.radToDeg(this.steeringAngle);
    }
}

export { Car, MassCategory, TireType, SurfaceType };
