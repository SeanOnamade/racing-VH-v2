import pytest
from src.car import Car, MassCategory, TireType

# @definition: test_initialization
# @params: None
# @returns: None
# Tests that car initializes correctly
def test_initialization():
    car = Car(MassCategory.Light, TireType.Slick, 0, 0)
    assert car.getPositionX() == 0
    assert car.getPositionY() == 0
    assert car.getVelocity() == 0
    assert car.getTireTemperature() == 20
    assert car.getTireGrip() == 1.0
    assert car.getAcceleration() == 0

# @definition: test_applyThrottle
# @params: None
# @returns: None
# Tests throttle application increases velocity
def test_applyThrottle():
    car = Car(MassCategory.Medium, TireType.Slick, 0, 0)
    car.applyThrottle(1.0, 1.0)
    assert car.getVelocity() > 0
    assert car.getVelocity() <= car.maxVelocity

# @definition: test_applyBrake
# @params: None
# @returns: None
# Tests braking reduces velocity
def test_applyBrake():
    car = Car(MassCategory.Heavy, TireType.Rain, 0, 0)
    car.applyThrottle(1.0, 1.0)
    initial_velocity = car.getVelocity()
    car.applyBrake(1.0, 1.0)
    assert car.getVelocity() < initial_velocity
    assert car.getVelocity() >= 0

# @definition: test_steering_limits
# @params: None
# @returns: None
# Tests that the steering is constrained within its limits
def test_steering_limits():
    car = Car(MassCategory.Light, TireType.Slick, 0, 0)
    car.updateSteering(1.0, 1.0)
    assert car.getSteeringAngleDegrees() <= 45
    car.updateSteering(-2.0, 1.0)
    assert car.getSteeringAngleDegrees() >= -45

# @definition: test_tire_grip
# @params: None
# @returns: None
# Tests that tire grip is affected by temperature and speed
def test_tire_grip():
    car = Car(MassCategory.Medium, TireType.Rain, 0, 0)
    initial_grip = car.getTireGrip()

    # Apply throttle and move the car to update tire temperature and grip
    car.applyThrottle(1.0, 1.0)
    car.updatePosition(1.0)

    # Ensure the tire grip has decreased after moving the car
    assert car.getTireGrip() < initial_grip, f"Tire grip did not decrease as expected: {car.getTireGrip()} >= {initial_grip}"

# @definition: test_updatePosition
# @params: None
# @returns: None
# Tests that the car's position updates correctly
def test_updatePosition():
    car = Car(MassCategory.Medium, TireType.Slick, 0, 0)
    car.applyThrottle(1.0, 1.0)
    car.updatePosition(1.0)
    assert car.getPositionX() != 0
    assert car.getPositionY() != 0
