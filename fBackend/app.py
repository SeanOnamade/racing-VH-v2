import sys
import os

## LEGACY CODE ##

from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.car import Car, MassCategory, TireType

app = Flask(__name__)

# Enable CORS for all routes in the application
CORS(app)

# Initialize car object (you can make this dynamic based on user input if needed)
car = Car(MassCategory.Medium, TireType.Slick, 0, 0)


# @definition: def apply_throttle()
#
# @params: None (Receives 'throttle' and 'deltaTime' from POST request body as JSON)
# @returns: JSON - A dictionary containing the updated car state, including:
#          positionX - The car's current X position
#          positionY - The car's current Y position
#          velocity - The car's current velocity
#          tireGrip - The car's current tire grip coefficient
#          tireTemperature - The car's current tire temperature
#          steeringAngle - The car's current steering angle in degrees
#
# @description: This API endpoint allows the client to apply throttle to the car,
#               updates the car's position, and returns the updated state.
@app.route('/api/apply_throttle', methods=['POST'])
def apply_throttle():
    data = request.json
    throttle = data.get('throttle', 0)
    deltaTime = data.get('deltaTime', 1.0)
    car.applyThrottle(throttle, deltaTime)
    car.updatePosition(deltaTime)

    # Debug statements for logging
    print(f"Throttle applied: {throttle}")
    print(f"New velocity: {car.getVelocity()}")
    print(f"New position: ({car.getPositionX()}, {car.getPositionY()})")

    return jsonify({
        'positionX': car.getPositionX(),
        'positionY': car.getPositionY(),
        'velocity': car.getVelocity(),
        'tireGrip': car.getTireGrip(),
        'tireTemperature': car.getTireTemperature(),
        'steeringAngle': car.getSteeringAngleDegrees()
    })


# @definition: def apply_brake()
#
# @params: None (Receives 'brake' and 'deltaTime' from POST request body as JSON)
# @returns: JSON - A dictionary containing the updated car state, including:
#          positionX - The car's current X position
#          positionY - The car's current Y position
#          velocity - The car's current velocity
#          tireGrip - The car's current tire grip coefficient
#          tireTemperature - The car's current tire temperature
#          steeringAngle - The car's current steering angle in degrees
#
# @description: This API endpoint allows the client to apply braking to the car,
#               updates the car's position, and returns the updated state.
@app.route('/api/apply_brake', methods=['POST'])
def apply_brake():
    data = request.json
    brake = data.get('brake', 0)
    deltaTime = data.get('deltaTime', 1.0)
    car.applyBrake(brake, deltaTime)
    car.updatePosition(deltaTime)

    # Debug statements for logging
    print(f"Brake applied: {brake}")
    print(f"New velocity: {car.getVelocity()}")
    print(f"New position: ({car.getPositionX()}, {car.getPositionY()})")

    return jsonify({
        'positionX': car.getPositionX(),
        'positionY': car.getPositionY(),
        'velocity': car.getVelocity(),
        'tireGrip': car.getTireGrip(),
        'tireTemperature': car.getTireTemperature(),
        'steeringAngle': car.getSteeringAngleDegrees()
    })


# @definition: def update_steering()
#
# @params: None (Receives 'steeringInput' and 'deltaTime' from POST request body as JSON)
# @returns: JSON - A dictionary containing the updated car state, including:
#          positionX - The car's current X position
#          positionY - The car's current Y position
#          velocity - The car's current velocity
#          tireGrip - The car's current tire grip coefficient
#          tireTemperature - The car's current tire temperature
#          steeringAngle - The car's current steering angle in degrees
#
# @description: This API endpoint allows the client to update the car's steering input,
#               updates the car's position, and returns the updated state.
@app.route('/api/update_steering', methods=['POST'])
def update_steering():
    data = request.json
    steeringInput = data.get('steeringInput', 0)
    deltaTime = data.get('deltaTime', 1.0)
    car.updateSteering(steeringInput, deltaTime)
    car.updatePosition(deltaTime)

    # Debug statements for logging
    print(f"Steering input: {steeringInput}")
    print(f"Steering angle (degrees): {car.getSteeringAngleDegrees()}")
    print(f"New position: ({car.getPositionX()}, {car.getPositionY()})")

    return jsonify({
        'positionX': car.getPositionX(),
        'positionY': car.getPositionY(),
        'velocity': car.getVelocity(),
        'tireGrip': car.getTireGrip(),
        'tireTemperature': car.getTireTemperature(),
        'steeringAngle': car.getSteeringAngleDegrees()
    })


if __name__ == '__main__':
    app.run(debug=True)
