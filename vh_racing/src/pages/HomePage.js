import React, { useEffect, useState } from 'react';

/**
 * @definition HomePage
 * @params None
 * @returns JSX.Element
 * HomePage component for rendering the main landing page of the web application.
 * Includes animated side-to-side motion and background images.
 */
const HomePage = () => {
  /**
   * @state isMoving
   * @description State variable to control the animation of the page's side-to-side motion.
   * @default false
   */
  const [isMoving, setIsMoving] = useState(false);

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Sets a timer to trigger the side-to-side motion 2 seconds after the page loads.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMoving(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col justify-between relative items-center"
         style={{ backgroundImage: "url('/track.jpg')" }}>
      
      {/* F1 Car Image behind the text */}
      <img 
        src="/f1car.png" 
        alt="F1 Car" 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90 w-2/3 h-auto pointer-events-none" 
      />
      
      <header className="w-full bg-blue-900 bg-opacity-75 py-6 shadow-md text-center">
        <h1 
          className={`text-4xl text-white font-bold text-center transition-transform duration-700 ease-in-out transform ${
            isMoving ? 'animate-slow-swing' : 'translate-y-10 opacity-0'
          }`}>
          Doodle Racing
        </h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center text-center justify-center bg-white bg-opacity-70 p-6 rounded-lg relative z-10">
        <p className="text-lg text-gray-700 mb-4">
          Welcome to Doodle Racing! The place where you can create the (pixelated!) racetrack of your dreams.
        </p>
        <p className="text-md text-gray-500 mb-8">
          All your racing desires can come true. Make a circle track, or a track shaped like the Mona-Lisa! THE WORLD (this webApp!) IS YOUR CANVAS!
        </p>

        <div className="flex space-x-4 mt-12">
          <a href="/auth" className="px-6 py-3 bg-blue-500 top-1/3 text-white rounded-lg hover:bg-blue-600 transition ease-in-out duration-150">
            Register to Race!!
          </a>
        </div>
      </main>

      <footer className="w-full bg-gray-800 bg-opacity-75 py-4 text-center">
        <p className="text-sm text-gray-400">&copy; 2024 DoodleRace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
