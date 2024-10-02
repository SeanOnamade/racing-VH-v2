<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!--
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
-->

<!-- PROJECT LOGO -->
<div align="center">
    <img src="https://github.com/zander-raycraft/racing-VH/blob/main/vh_racing/public/f1car.png" width="300">
</div>
<h1 align="center">Doodle Racing</h1>

  <p align="center">
    An application that allows users to draw custom racetracks and test them out for themselves! Built @ VandyHacksXI!
    <br />
    <br />
    <a href="https://github.com/SeanOnamade/repo_name"><strong>Explore the docs »</strong></a>
    <br />
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage-and-demo">Usage and Demo</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
<!--     <li><a href="#contributing">Contributing</a></li> -->
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/Screenshot1.png)

Doodle Racing is a fun application that lets users create, save, and race on custom-designed tracks. It’s designed to allow players to draw their racetrack with a flexible drawing tool and simulate racing on these tracks.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

<div align="center">
  
![GitHub Fork](https://img.shields.io/badge/Code-Html5-orange?logo=html5&logoColor=orange)
![GitHub Fork](https://img.shields.io/badge/Code-JavaScript-yellow?logo=javascript&logoColor=yellow)
![GitHub Fork](https://img.shields.io/badge/Code-TypeScript-lightblue?logo=typescript&logoColor=lightblue)

![CSS](https://img.shields.io/badge/Style-CSS-1572B6?logo=css3&logoColor=white)
![GitHub Fork](https://img.shields.io/badge/Style-Tailwind-06B6D4?logo=tailwindcss&logoColor=white)

![GitHub Fork](https://img.shields.io/badge/Framework-React.js-teal?logo=react&logoColor=lightblue)
![GitHub Fork](https://img.shields.io/badge/Framework-Flask-red?logo=flask&logoColor=red)
![Express.js](https://img.shields.io/badge/Framework-Express.js-6A5ACD?logo=express&logoColor=white)

![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)

![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb&logoColor=white)
</div>


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

> [!TIP]
To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/zander-raycraft/racing-VH.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Navigate to the backend directory
   ```sh
   cd backend
   ```
4. Compile the dist
   ```sh
   npx tsc
   ```
5. Start the server
   ```sh
   node dist/server.js
   ```
6. Navigate to the project directory
   ```sh
   cd ..
   cd racing-VH
   ```
7. Start the development server
   ```sh
   npm run start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage and Demo

![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/appdemo.gif)

Draw a custom racetrack using the drawing tool, and race on it!
- Signup on the Signup/Login page
- Once authenticated, go to Draw to draw and save your own tracks!
  - Load them in!
  - Go to Race to load a downloaded track in and race with it!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/Screenshot2.png)

<!-- ROADMAP -->
## Roadmap

- [X] Working authentication with MongoDB
- [X] Track drawing functionality, saving tracks as JSONs with coordinates
- [X] Tracks can be downloaded and saved as jsons
- [X] Saved tracks are stored in the database for the user
- [X] Tracks can be validated and sent to the Race route
- [X] Tracklist
    - [X] Track loading/previews
    - [X] Track deletion
- [X] Tracks can be raced with a camera following the user
- [X] Racing controls display instructions and acceleration

![Gif Demo](https://github.com/zander-raycraft/racing-VH/blob/main/appdemo.gif)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/Screenshot3.png)
![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/Screenshot4.png)
![Screenshot](https://github.com/zander-raycraft/racing-VH/blob/main/Screenshot5.png)



<!-- CONTRIBUTING -->
<!-- ## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Zander Raycraft - [zander.j.raycraft@vanderbilt.edu](zander.j.raycraft@vanderbilt.edu)

Sean Onamade - [sean.d.onamade@vanderbilt.edu](sean.d.onamade@vanderbilt.edu)

Ethan Milton - [ethan.h.milton@vanderbilt.edu](ethan.h.milton@vanderbilt.edu)
<br>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/SeanOnamade/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/SeanOnamade/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/SeanOnamade/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/SeanOnamade/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/SeanOnamade/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/SeanOnamade/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/SeanOnamade/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/SeanOnamade/repo_name/issues
[license-shield]: https://img.shields.io/github/license/SeanOnamade/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/SeanOnamade/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/seanonamade
[product-screenshot]: images/screenshot.png

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
[HTML-shield]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://www.w3schools.com/html/
[CSS-shield]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://www.w3schools.com/css/
[JavaScript-shield]: https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E
[JavaScript-url]: https://www.w3schools.com/js/
