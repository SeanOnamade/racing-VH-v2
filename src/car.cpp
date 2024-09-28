#include "car.h"
#include <cmath>
#include <iostream>  // Added for output testing if needed

//NOTES: ALTER VALUES

/**
 * @details: Class constructor
 * 
*/
Car::Car(MassCategory mCat, TireType tType, double startX, double startY) 
    : velocity(0), angle(0), positionX(startX), positionY(startY), massCategory(mCat), tireType(tType), minTireGrip(0.5), traction(1.0)  // Initialize traction
{
    setMassCategory(mCat);
    setTireType(tType);
    gripDecayRate = 0.001;
}

/**
 * @details: assign mass value for the car
 * 
 * @params: mCat -> mass category
*/
void Car::setMassCategory(MassCategory mCat) {
    switch (mCat) {
        case Light:
            mass = 1800.0;
            break;
        case Medium:
            mass = 2800.0;
            break;
        case Heavy:
            mass = 3800.0;
            break;
    }
}

/**
 * @details: assign tire type for the car
 * 
 * @params: tCat -> type type
*/
void Car::setTireType(TireType tType) {
    switch (tType) {
        case Rain:
            tireGrip = 0.7;
            break;
        case Slick:
            tireGrip = 1.0;
            break;
    }
}

/**
 * @details: moves the car forward applying throttle.
 * 
 * @params: throttle -> 0-1 value for amount of throttle applied
*/
void Car::applyThrottle(double throttle) {
    velocity += throttle * traction / mass;
}

void Car::applyBrake(double brakeForce) {
    velocity -= brakeForce / mass;
    if (velocity < 0) velocity = 0;
}

void Car::turn(double steeringAngle) {
    angle += steeringAngle;
}

void Car::updatePosition(double deltaTime) {
    double driftFactor = 0.05;  // Drifting effect, higher means more sliding

    // Calculate velocity components based on the car's angle and drift
    double driftX = velocity * sin(angle) * (1 - driftFactor);
    double driftY = velocity * cos(angle) * (1 - driftFactor);

    positionX += driftX * deltaTime;
    positionY -= driftY * deltaTime;

    applyTireStress(angle, velocity, deltaTime);
}

void Car::applyWeatherEffect(double gripModifier) {
    tireGrip *= gripModifier;
    if (tireType == Rain) {
        tireGrip *= 1.2;
    }
}

/**
 * @brief Applies stress to the tire based on the car's velocity and turning angle.
 * 
 * The faster the car moves and the sharper it turns, the faster the tire grip decays.
 * Tire grip cannot decay below a minimum threshold.
 * 
 * @param steeringAngle
 * @param velocity
 * @param deltaTime 
 */
void Car::applyTireStress(double steeringAngle, double velocity, double deltaTime) {
    double stressFactor = fabs(steeringAngle) * velocity;  // More stress with sharper turns and higher speeds
    double decayAmount = stressFactor * gripDecayRate * deltaTime;

    tireGrip -= decayAmount;
    if (tireGrip < minTireGrip) {
        tireGrip = minTireGrip;  // Ensure tire grip doesn't fall below minimum
    }
}

/**
 * C API to interact with Python via ctypes
 */
extern "C" {

    Car* Car_new(int massCategory, int tireType, double startX, double startY) {
        return new Car(static_cast<MassCategory>(massCategory), static_cast<TireType>(tireType), startX, startY);
    }

    void Car_applyThrottle(Car* car, double throttle) {
        car->applyThrottle(throttle);
    }

    void Car_applyBrake(Car* car, double brakeForce) {
        car->applyBrake(brakeForce);
    }

    void Car_turn(Car* car, double steeringAngle) {
        car->turn(steeringAngle);
    }

    void Car_updatePosition(Car* car, double deltaTime) {
        car->updatePosition(deltaTime);
    }

    double Car_getPositionX(Car* car) {
        return car->getPositionX();
    }

    double Car_getPositionY(Car* car) {
        return car->getPositionY();
    }

    double Car_getVelocity(Car* car) {
        return car->getVelocity();
    }

    void Car_delete(Car* car) {
        delete car;
    }
}
