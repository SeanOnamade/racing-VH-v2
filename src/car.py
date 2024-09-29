from enum import Enum
import math

## LEGACY CODE ##

class MassCategory(Enum):
    Light = 0
    Medium = 1
    Heavy = 2

class TireType(Enum):
    Rain = 0
    Slick = 1

class SurfaceType(Enum):
    Asphalt = 0
    Gravel = 1
    Ice = 2

class Car:
    def __init__(self, mCat, tType, startX, startY):
        self.positionX = startX
        self.positionY = startY
        self.massCategory = mCat
        self.tireType = tType
        self.surfaceType = SurfaceType.Asphalt
        self.angle = 0.0
        self.velocity = 0.0
        self.acceleration = 0.0
        self.tireTemperature = 20.0
        self.tireGrip = None
        self.base_tireGrip = None
        self.minTireGrip = 0.5
        self.gripDecayRate = 0.001
        self.traction = 1.0
        self.setMassCategory(mCat)
        self.setTireType(tType)

        if mCat == MassCategory.Light and tType == TireType.Slick:
            self.maxVelocity = 200.0
        elif mCat == MassCategory.Medium and tType == TireType.Slick:
            self.maxVelocity = 180.0
        elif mCat == MassCategory.Heavy and tType == TireType.Slick:
            self.maxVelocity = 160.0
        elif tType == TireType.Rain:
            self.maxVelocity = 140.0
        else:
            self.maxVelocity = 180.0

        self.wheelbase = 2.5
        self.setCorneringStiffness()

        self.steering_angle = 0.0
        self.max_steering_angle = math.radians(45)
        self.steering_speed = math.radians(60)

    def setMassCategory(self, mCat):
        if mCat == MassCategory.Light:
            self.mass = 1800.0 * 0.453592
        elif mCat == MassCategory.Medium:
            self.mass = 2800.0 * 0.453592
        elif mCat == MassCategory.Heavy:
            self.mass = 3800.0 * 0.453592

    def setTireType(self, tType):
        if tType == TireType.Rain:
            self.base_tireGrip = 0.7
        elif tType == TireType.Slick:
            self.base_tireGrip = 1.0
        self.tireGrip = self.base_tireGrip

    def setCorneringStiffness(self):
        if self.tireType == TireType.Slick:
            base_stiffness = 150000
        elif self.tireType == TireType.Rain:
            base_stiffness = 100000

        self.Cf = base_stiffness * 0.6
        self.Cr = base_stiffness * 0.4

    def calculateUndersteerGradient(self):
        Wf = self.mass * 0.6
        Wr = self.mass * 0.4
        K = (self.wheelbase / self.mass) * ((Wf / self.Cf) - (Wr / self.Cr))
        return K

    def applyThrottle(self, throttle, deltaTime):
        maxAcceleration = 30.0
        acceleration = throttle * maxAcceleration * self.traction * (1 - self.velocity / self.maxVelocity)
        if acceleration < 0:
            acceleration = 0
        self.acceleration = acceleration
        self.velocity += self.acceleration * deltaTime
        if self.velocity > self.maxVelocity:
            self.velocity = self.maxVelocity

        # Debug statement for throttle application
        print(
            f"Throttle: {throttle}, Acceleration: {self.acceleration}, Velocity: {self.velocity}, Position: ({self.positionX}, {self.positionY})")

    def applyBrake(self, brakeForce, deltaTime):
        maxDeceleration = 50.0
        deceleration = brakeForce * maxDeceleration * self.traction
        self.acceleration = -deceleration
        self.velocity += self.acceleration * deltaTime
        if self.velocity < 0:
            self.velocity = 0.0
            self.acceleration = 0.0

        # Debug statement for brake application
        print(
            f"Brake: {brakeForce}, Deceleration: {self.acceleration}, Velocity: {self.velocity}, Position: ({self.positionX}, {self.positionY})")

    def updateSteering(self, steeringInput, deltaTime):
        self.steering_angle += steeringInput * self.steering_speed * deltaTime
        if self.steering_angle > self.max_steering_angle:
            self.steering_angle = self.max_steering_angle
        elif self.steering_angle < -self.max_steering_angle:
            self.steering_angle = -self.max_steering_angle

        # Debug statement for steering input
        print(f"Steering input: {steeringInput}, Steering angle (deg): {math.degrees(self.steering_angle)}")

    def updatePosition(self, deltaTime):
        rollingResistance = 12.0
        dragCoefficient = 0.4257
        airDensity = 1.225
        frontalArea = 2.2
        dragForce = 0.5 * dragCoefficient * airDensity * frontalArea * self.velocity ** 2

        totalResistance = (rollingResistance + dragForce) / self.mass
        self.velocity -= totalResistance * deltaTime
        if self.velocity < 0:
            self.velocity = 0

        if self.velocity > 0:
            if self.steering_angle == 0.0:
                self.steering_angle = 0.01
            K = self.calculateUndersteerGradient()
            adjustedSteeringAngle = self.steering_angle * (1 + K)

            speed_factor = max(0.5, 1 - (self.velocity / self.maxVelocity) * 0.5)
            steering_effectiveness = 0.9 * speed_factor
            adjustedSteeringAngle *= steering_effectiveness

            self.updateTireGrip()
            self.traction = self.tireGrip

            if adjustedSteeringAngle != 0:
                turning_radius = self.wheelbase / math.tan(adjustedSteeringAngle)
            else:
                turning_radius = float('inf')

            angular_velocity = self.velocity / turning_radius if turning_radius != float('inf') else 0.0
            self.angle += angular_velocity * deltaTime
            self.angle = self.angle % (2 * math.pi)

            forwardX = self.velocity * math.cos(self.angle) * deltaTime
            forwardY = self.velocity * math.sin(self.angle) * deltaTime
            self.positionX += forwardX
            self.positionY += forwardY

            self.updateTireTemperature(deltaTime)
            self.applyTireStress(self.steering_angle, self.velocity, deltaTime)

        # Debug statement for position update
        print(
            f"Updated position: ({self.positionX}, {self.positionY}), Velocity: {self.velocity}, Steering angle: {math.degrees(self.steering_angle)}")

        if abs(self.steering_angle) > 0:
            steeringReturnSpeed = math.radians(30)
            steeringReturn = steeringReturnSpeed * deltaTime
            if self.steering_angle > 0:
                self.steering_angle -= min(steeringReturn, self.steering_angle)
            else:
                self.steering_angle += min(steeringReturn, -self.steering_angle)

    def updateTireTemperature(self, deltaTime):
        tempIncrease = (abs(self.steering_angle) + 0.1) * self.velocity * 0.05 * deltaTime
        tempDecrease = (self.tireTemperature - 20.0) * 0.1 * deltaTime
        self.tireTemperature += tempIncrease - tempDecrease
        if self.tireTemperature < 20.0:
            self.tireTemperature = 20.0

    def updateTireGrip(self):
        optimalTemp = 90.0
        tempDifference = abs(self.tireTemperature - optimalTemp)
        temperatureEffect = max(0.5, 1 - (tempDifference / 100))

        speedEffect = max(0.7, 1 - (self.velocity / self.maxVelocity) * 0.3)
        steeringEffect = max(0.7, 1 - ((abs(self.steering_angle) + 0.1) / self.max_steering_angle) * 0.3)

        self.tireGrip = self.base_tireGrip * temperatureEffect * speedEffect * steeringEffect
        if self.tireGrip < self.minTireGrip:
            self.tireGrip = self.minTireGrip

        # Debug statement for tire grip
        print(f"Tire temperature: {self.tireTemperature}, Tire grip: {self.tireGrip}")

    def applyTireStress(self, steeringAngle, velocity, deltaTime):
        stressFactor = (abs(steeringAngle) + 0.1) * velocity
        decayAmount = stressFactor * self.gripDecayRate * deltaTime
        self.tireGrip -= decayAmount
        if self.tireGrip < self.minTireGrip:
            self.tireGrip = self.minTireGrip

    def getPositionX(self):
        return self.positionX

    def getPositionY(self):
        return self.positionY

    def getVelocity(self):
        return self.velocity

    def getAcceleration(self):
        return self.acceleration

    def getTireGrip(self):
        return self.tireGrip

    def getTireTemperature(self):
        return self.tireTemperature

    def getSteeringAngleDegrees(self):
        return math.degrees(self.steering_angle)
