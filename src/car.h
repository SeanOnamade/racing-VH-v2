#ifndef CAR_H
#define CAR_H

/**
 * 
 * Light = 1800 lbs
 * Medium = 2800 lbs
 * Heavy = 3800 lbs
 * 
*/
enum MassCategory 
{
    Light,
    Medium,
    Heavy
};

/**
 * 
 * Weather dependent tires, users can select
 * 
*/
enum TireType 
{
    Rain,
    Slick
};

class Car 
{
    private:
        double mass;
        double tireGrip;   
        double traction;   
        double velocity;
        double angle;
        double positionX;
        double positionY;
        MassCategory massCategory;
        TireType tireType;
        double minTireGrip;
        double gripDecayRate;

    public:
        Car(MassCategory mCat, TireType tType, double startX, double startY);
        void applyThrottle(double throttle);
        void applyBrake(double brakeForce);
        void turn(double steeringAngle);
        void updatePosition(double deltaTime);
        void setPositionX(double x) { positionX = x; }
        void setPositionY(double y) { positionY = y; }
        void applyWeatherEffect(double gripModifier);
        void applyTireStress(double steeringAngle, double velocity, double deltaTime);
        double getPositionX() const { return positionX; }
        double getPositionY() const { return positionY; }
        double getVelocity() const { return velocity; }
        void setTireType(TireType tType);
        void setMassCategory(MassCategory mCat);
};

#endif
