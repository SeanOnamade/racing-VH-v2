from enum import Enum
import math

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
    # @definition: def __init__(self, mCat, tType, startX, startY)
    #
    # @params: mCat - MassCategory enum value representing the car's mass category
    #          tType - TireType enum value representing the car's tire type
    #          startX - initial X position
    #          startY - initial Y position
    # @returns: None
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
        self.weight = self.mass * 9.81
        self.weight_distribution = 0.6
        self.Cf = None
        self.Cr = None
        self.setCorneringStiffness()

        self.steering_angle = 0.0
        self.max_steering_angle = math.radians(45)
        self.steering_speed = math.radians(60)

    # @definition: def setMassCategory(self, mCat)
    #
    # @params: mCat - MassCategory enum value representing the car's mass category
    # @returns: None
    def setMassCategory(self, mCat):
        if mCat == MassCategory.Light:
            self.mass = 1800.0 * 0.453592
        elif mCat == MassCategory.Medium:
            self.mass = 2800.0 * 0.453592
        elif mCat == MassCategory.Heavy:
            self.mass = 3800.0 * 0.453592

    # @definition: def setTireType(self, tType)
    #
    # @params: tType - TireType enum value representing the car's tire type
    # @returns: None
    def setTireType(self, tType):
        if tType == TireType.Rain:
            self.base_tireGrip = 0.7
        elif tType == TireType.Slick:
            self.base_tireGrip = 1.0
        self.tireGrip = self.base_tireGrip

    # @definition: def setCorneringStiffness(self)
    #
    # @params: None
    # @returns: None
    def setCorneringStiffness(self):
        if self.tireType == TireType.Slick:
            base_stiffness = 150000
        elif self.tireType == TireType.Rain:
            base_stiffness = 100000

        self.Cf = base_stiffness * self.weight_distribution
        self.Cr = base_stiffness * (1 - self.weight_distribution)

    # @definition: def calculateUndersteerGradient(self)
    #
    # @params: None
    # @returns: K - the understeer gradient
    def calculateUndersteerGradient(self):
        Wf = self.weight * self.weight_distribution
        Wr = self.weight * (1 - self.weight_distribution)
        K = (self.wheelbase / self.weight) * ((Wf / self.Cf) - (Wr / self.Cr))
        return K

    # @definition: def applyThrottle(self, throttle, deltaTime)
    #
    # @params: throttle - throttle input (0.0 to 1.0)
    #          deltaTime - time step in seconds
    # @returns: None
    def applyThrottle(self, throttle, deltaTime):
        maxAcceleration = 30.0
        acceleration = throttle * maxAcceleration * self.traction * (1 - self.velocity / self.maxVelocity)
        if acceleration < 0:
            acceleration = 0
        self.acceleration = acceleration
        self.velocity += self.acceleration * deltaTime
        if self.velocity > self.maxVelocity:
            self.velocity = self.maxVelocity

    # @definition: def applyBrake(self, brakeForce, deltaTime)
    #
    # @params: brakeForce - brake input (0.0 to 1.0)
    #          deltaTime - time step in seconds
    # @returns: None
    def applyBrake(self, brakeForce, deltaTime):
        maxDeceleration = 50.0
        deceleration = brakeForce * maxDeceleration * self.traction
        self.acceleration = -deceleration
        self.velocity -= deceleration * deltaTime
        if self.velocity < 0:
            self.velocity = 0.0
            self.acceleration = 0.0

    # @definition: def updateSteering(self, steeringInput, deltaTime)
    #
    # @params: steeringInput - steering input (-1.0 to 1.0)
    #          deltaTime - time step in seconds
    # @returns: None
    def updateSteering(self, steeringInput, deltaTime):
        self.steering_angle += steeringInput * self.steering_speed * deltaTime
        if self.steering_angle > self.max_steering_angle:
            self.steering_angle = self.max_steering_angle
        elif self.steering_angle < -self.max_steering_angle:
            self.steering_angle = -self.max_steering_angle

    # @definition: def updatePosition(self, deltaTime)
    #
    # @params: deltaTime - time step in seconds
    # @returns: None
    def updatePosition(self, deltaTime):
        rollingResistance = 12.0
        dragCoefficient = 0.4257
        airDensity = 1.225
        frontalArea = 2.2
        dragForce = 0.5 * dragCoefficient * airDensity * frontalArea * self.velocity**2

        totalResistance = (rollingResistance + dragForce) / self.mass

        self.velocity -= totalResistance * deltaTime
        if self.velocity < 0:
            self.velocity = 0

        if self.velocity > 0:
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

        if abs(self.steering_angle) > 0:
            steeringReturnSpeed = math.radians(30)
            steeringReturn = steeringReturnSpeed * deltaTime
            if self.steering_angle > 0:
                self.steering_angle -= min(steeringReturn, self.steering_angle)
            else:
                self.steering_angle += min(steeringReturn, -self.steering_angle)

    # @definition: def updateTireTemperature(self, deltaTime)
    #
    # @params: deltaTime - time step in seconds
    # @returns: None
    def updateTireTemperature(self, deltaTime):
        tempIncrease = (abs(self.steering_angle) * self.velocity) * 0.05 * deltaTime
        tempDecrease = (self.tireTemperature - 20.0) * 0.1 * deltaTime
        self.tireTemperature += tempIncrease - tempDecrease
        if self.tireTemperature < 20.0:
            self.tireTemperature = 20.0

    # @definition: def updateTireGrip(self)
    #
    # @params: None
    # @returns: None
    def updateTireGrip(self):
        optimalTemp = 90.0
        tempDifference = abs(self.tireTemperature - optimalTemp)
        temperatureEffect = max(0.5, 1 - (tempDifference / 100))

        speedEffect = max(0.7, 1 - (self.velocity / self.maxVelocity) * 0.3)
        steeringEffect = max(0.7, 1 - (abs(self.steering_angle) / self.max_steering_angle) * 0.3)

        self.tireGrip = self.base_tireGrip * temperatureEffect * speedEffect * steeringEffect
        if self.tireGrip < self.minTireGrip:
            self.tireGrip = self.minTireGrip

    # @definition: def applyTireStress(self, steeringAngle, velocity, deltaTime)
    #
    # @params: steeringAngle - current steering angle in radians
    #          velocity - current velocity in m/s
    #          deltaTime - time step in seconds
    # @returns: None
    def applyTireStress(self, steeringAngle, velocity, deltaTime):
        stressFactor = abs(steeringAngle) * velocity
        decayAmount = stressFactor * self.gripDecayRate * deltaTime
        self.tireGrip -= decayAmount
        if self.tireGrip < self.minTireGrip:
            self.tireGrip = self.minTireGrip

    # @definition: def getPositionX(self)
    #
    # @params: None
    # @returns: positionX - current X position
    def getPositionX(self):
        return self.positionX

    # @definition: def getPositionY(self)
    #
    # @params: None
    # @returns: positionY - current Y position
    def getPositionY(self):
        return self.positionY

    # @definition: def getVelocity(self)
    #
    # @params: None
    # @returns: velocity - current velocity in m/s
    def getVelocity(self):
        return self.velocity

    # @definition: def getAcceleration(self)
    #
    # @params: None
    # @returns: acceleration - current acceleration in m/s²
    def getAcceleration(self):
        return self.acceleration

    # @definition: def getTireGrip(self)
    #
    # @params: None
    # @returns: tireGrip - current tire grip coefficient
    def getTireGrip(self):
        return self.tireGrip

    # @definition: def getTireTemperature(self)
    #
    # @params: None
    # @returns: tireTemperature - current tire temperature in Celsius
    def getTireTemperature(self):
        return self.tireTemperature

    # @definition: def getSteeringAngleDegrees(self)
    #
    # @params: None
    # @returns: steeringAngleDegrees - current steering angle in degrees
    def getSteeringAngleDegrees(self):
        return math.degrees(self.steering_angle)
