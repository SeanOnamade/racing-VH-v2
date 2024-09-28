import ctypes
import pygame
import time

lib = ctypes.CDLL("./libcar.dylib")

class Car:
    def __init__(self, mass_category, tire_type):
        lib.Car_new.argtypes = [ctypes.c_int, ctypes.c_int]
        lib.Car_new.restype = ctypes.c_void_p

        self.obj = lib.Car_new(mass_category, tire_type)

    def apply_throttle(self, throttle):
        lib.Car_applyThrottle.argtypes = [ctypes.c_void_p, ctypes.c_double]
        lib.Car_applyThrottle(self.obj, throttle)

    def apply_brake(self, brake_force):
        lib.Car_applyBrake.argtypes = [ctypes.c_void_p, ctypes.c_double]
        lib.Car_applyBrake(self.obj, brake_force)

    def turn(self, steering_angle):
        lib.Car_turn.argtypes = [ctypes.c_void_p, ctypes.c_double]
        lib.Car_turn(self.obj, steering_angle)

    def update_position(self, delta_time):
        lib.Car_updatePosition.argtypes = [ctypes.c_void_p, ctypes.c_double]
        lib.Car_updatePosition(self.obj, delta_time)

    def get_position_x(self):
        lib.Car_getPositionX.argtypes = [ctypes.c_void_p]
        lib.Car_getPositionX.restype = ctypes.c_double
        return lib.Car_getPositionX(self.obj)

    def get_position_y(self):
        lib.Car_getPositionY.argtypes = [ctypes.c_void_p]
        lib.Car_getPositionY.restype = ctypes.c_double
        return lib.Car_getPositionY(self.obj)

    def get_velocity(self):
        lib.Car_getVelocity.argtypes = [ctypes.c_void_p]
        lib.Car_getVelocity.restype = ctypes.c_double
        return lib.Car_getVelocity(self.obj)

    def __del__(self):
        lib.Car_delete.argtypes = [ctypes.c_void_p]
        lib.Car_delete(self.obj)

pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption('Car Simulation')

car = Car(1, 1)  # Initialize car with medium mass and slick tires

# Starting car position in the middle of the screen
start_x = 400
start_y = 300
car_rect = pygame.Rect(start_x, start_y, 50, 100)

clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()

    throttle = 0.0
    steering = 0.0

    if keys[pygame.K_w]:  # W to accelerate
        throttle = 1.0
        car.apply_throttle(throttle)
    if keys[pygame.K_s]:  # S to brake
        car.apply_brake(1.0)
    if keys[pygame.K_a]:  # A to turn left
        steering = -0.1
        car.turn(steering)
    if keys[pygame.K_d]:  # D to turn right
        steering = 0.1
        car.turn(steering)

    # Update car position
    delta_time = clock.get_time() / 1000.0
    car.update_position(delta_time)

    screen.fill((0, 0, 0))  # Clear the screen

    # Update the car's position from the C++ side
    car_x = car.get_position_x()
    car_y = car.get_position_y()
    car_velocity = car.get_velocity()

    # Update the car's rectangle position
    car_rect = pygame.Rect(car_x, car_y, 50, 100)
    pygame.draw.rect(screen, (0, 128, 255), car_rect)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
