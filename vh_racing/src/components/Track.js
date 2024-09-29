/**
 * @definition Track
 * @params streetDiameter, points
 * @returns Track object
 * Track class representing a track made of points and a specified street diameter.
 */
class Track {
  constructor(streetDiameter = 40, points = []) {
      this.points = points;
      this.drawing = false;
      this.streetDiameter = streetDiameter;
  }

  /**
   * @definition fromJSON
   * @params jsonData
   * @returns Track object
   * Creates a Track object from JSON data.
   */
  static fromJSON(jsonData) {
      const points = jsonData.track.map((point) => [point.x, point.y]);
      const streetDiameter = jsonData.streetDiameter || 60;
      return new Track(streetDiameter, points);
  }

  /**
   * @definition addPoint
   * @params pos
   * @returns None
   * Adds a point to the track.
   */
  addPoint(pos) {
      this.points.push(pos);
  }

  /**
   * @definition closeTrack
   * @params None
   * @returns None
   * Closes the track by connecting the last point to the first.
   */
  closeTrack() {
      if (this.points.length) {
          this.points.push(this.points[0]);
      }
  }

  /**
   * @definition save
   * @params None
   * @returns Object
   * Saves the track to a JSON object with a randomly generated filename.
   */
  save() {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const filename = `track_${randomNumber}.json`;
      const trackData = {
          track: this.points.map(([x, y]) => ({ x, y })),
          streetDiameter: this.streetDiameter,
      };
      return { filename, trackData };
  }

  /**
   * @definition load
   * @params data
   * @returns None
   * Loads a track from the provided data.
   */
  load(data) {
      this.points = data.track.map(point => [point.x, point.y]);
      this.streetDiameter = data.streetDiameter || 10;
  }

  /**
   * @definition clear
   * @params None
   * @returns None
   * Clears all points and resets the drawing state.
   */
  clear() {
      this.points = [];
      this.drawing = false;
  }

  /**
   * @definition draw
   * @params ctx
   * @returns None
   * Draws the track on the given canvas context.
   */
  draw(ctx) {
      const colors = ['grey', 'black'];
      const widths = [this.streetDiameter + 10, this.streetDiameter];

      if (this.points.length > 1) {
          for (let i = 0; i < colors.length; i++) {
              ctx.strokeStyle = colors[i];
              ctx.lineWidth = widths[i];

              ctx.beginPath();
              ctx.moveTo(this.points[0][0], this.points[0][1]);
              for (let j = 1; j < this.points.length; j++) {
                  ctx.lineTo(this.points[j][0], this.points[j][1]);
              }
              ctx.stroke();

              ctx.fillStyle = colors[i];
              for (const point of this.points) {
                  ctx.beginPath();
                  ctx.arc(point[0], point[1], widths[i] / 2, 0, Math.PI * 2);
                  ctx.fill();
              }
          }
      }
  }

  /**
   * @definition drawScaled
   * @params ctx, scaleFactor
   * @returns None
   * Draws the track scaled by the given factor on the canvas context.
   */
  drawScaled(ctx, scaleFactor) {
      const colors = ['grey', 'black'];
      const widths = [this.streetDiameter * scaleFactor + 10 * scaleFactor, this.streetDiameter * scaleFactor];

      if (this.points.length > 1) {
          for (let i = 0; i < colors.length; i++) {
              ctx.strokeStyle = colors[i];
              ctx.lineWidth = widths[i];

              ctx.beginPath();
              ctx.moveTo(this.points[0][0] * scaleFactor, this.points[0][1] * scaleFactor); // Scale points
              for (let j = 1; j < this.points.length; j++) {
                  ctx.lineTo(this.points[j][0] * scaleFactor, this.points[j][1] * scaleFactor); // Scale points
              }
              ctx.stroke();

              ctx.fillStyle = colors[i];
              for (const point of this.points) {
                  ctx.beginPath();
                  ctx.arc(point[0] * scaleFactor, point[1] * scaleFactor, widths[i] / 2, 0, Math.PI * 2); // Scale points
                  ctx.fill();
              }
          }
      } else {
          console.error("No points to draw.");
      }
  }

  /**
   * @definition getDirection
   * @params None
   * @returns Number
   * Calculates and returns the direction (angle in radians) between the first two points of the track.
   */
  getDirection() {
      if (this.points.length > 1) {
          const [x1, y1] = this.points[0];
          const [x2, y2] = this.points[1];
          const angle = Math.atan2(y2 - y1, x2 - x1);
          return angle;
      }
      return 0;
  }

  /**
   * @definition getCheckpoints
   * @params None
   * @returns Array
   * Divides the track into 4 checkpoints and returns the points representing these checkpoints.
   */
  getCheckpoints() {
      const numCheckpoints = 4;
      const checkpointInterval = Math.floor(this.points.length / numCheckpoints);
      let checkpoints = [];
      for (let i = 0; i < numCheckpoints; i++) {
          checkpoints.push(this.points[i * checkpointInterval]);
      }
      return checkpoints;
  }

  /**
   * @definition isCarWithinTrack
   * @params carPos, carWidth
   * @returns Boolean
   * Checks if the car is within the boundaries of the track based on its position and width.
   */
  isCarWithinTrack(carPos, carWidth) {
      const margin = this.streetDiameter / 2;
      for (let i = 0; i < this.points.length - 1; i++) {
          const [x1, y1] = this.points[i];
          const [x2, y2] = this.points[i + 1];

          if (
              carPos[0] > Math.min(x1, x2) - margin &&
              carPos[0] < Math.max(x1, x2) + margin &&
              carPos[1] > Math.min(y1, y2) - margin &&
              carPos[1] < Math.max(y1, y2) + margin
          ) {
              return true;
          }
      }
      return false;
  }
}

export default Track;
