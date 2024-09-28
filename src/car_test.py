import pygame
import math
from enum import Enum
from car import Car, MassCategory, TireType  # Importing from car.py

# Pygame setup
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Car Simulation")

# Clock to control frame rate
clock = pygame.time.Clock()

# Load a simple car image or create a rectangle
car_image = pygame.Surface((60, 30), pygame.SRCALPHA)
pygame.draw.polygon(car_image, (255, 0, 0), [(0, 0), (60, 15), (0, 30)])

# Create a car instance
car = Car(MassCategory.Medium, TireType.Slick, WIDTH // 2, HEIGHT // 2)

# Initialize font for displaying information
font = pygame.font.SysFont(None, 24)

running = True
while running:
    deltaTime = clock.tick(60) / 1000.0  # Time in seconds since last frame

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Key states
    keys = pygame.key.get_pressed()

    # Controls
    throttle = 0.0
    brake = 0.0
    steeringInput = 0.0

    if keys[pygame.K_UP]:
        throttle = 1.0  # Full throttle
    if keys[pygame.K_DOWN]:
        brake = 1.0  # Full brake
    if keys[pygame.K_LEFT]:
        steeringInput = -1.0  # Turn left
    elif keys[pygame.K_RIGHT]:
        steeringInput = 1.0  # Turn right

    # Apply controls to car
    car.applyThrottle(throttle, deltaTime)
    car.applyBrake(brake, deltaTime)
    car.updateSteering(steeringInput, deltaTime)
    car.updatePosition(deltaTime)

    # Clear screen
    screen.fill((255, 255, 255))  # White background

    # Draw car
    # Rotate the car image according to the car's angle
    angle_degrees = -math.degrees(car.angle)
    rotated_image = pygame.transform.rotate(car_image, angle_degrees)
    rect = rotated_image.get_rect(center=(car.getPositionX(), car.getPositionY()))
    screen.blit(rotated_image, rect.topleft)

    # Display information
    speed_text = font.render(f"Speed: {car.getVelocity():.2f} m/s", True, (0, 0, 0))
    acceleration_text = font.render(f"Acceleration: {car.getAcceleration():.2f} m/s²", True, (0, 0, 0))
    tire_grip_text = font.render(f"Tire Grip: {car.getTireGrip():.2f}", True, (0, 0, 0))
    tire_temp_text = font.render(f"Tire Temp: {car.getTireTemperature():.1f}°C", True, (0, 0, 0))
    steering_angle_text = font.render(f"Steering Angle: {car.getSteeringAngleDegrees():.1f}°", True, (0, 0, 0))

    # Blit texts onto screen
    screen.blit(speed_text, (10, 10))
    screen.blit(acceleration_text, (10, 30))
    screen.blit(tire_grip_text, (10, 50))
    screen.blit(tire_temp_text, (10, 70))
    screen.blit(steering_angle_text, (10, 90))

    # Update display
    pygame.display.flip()

pygame.quit()
