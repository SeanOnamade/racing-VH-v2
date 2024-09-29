// track.js

class Track {
    constructor(streetDiameter = 40, points = []) {
      this.points = points;
      this.drawing = false;
      this.streetDiameter = streetDiameter;
    }
  
    static fromJSON(jsonData) {
      const points = jsonData.track.map((point) => [point.x, point.y]);
      const streetDiameter = jsonData.streetDiameter || 40;
      return new Track(streetDiameter, points);
    }
  
    addPoint(pos) {
      this.points.push(pos);
    }
  
    closeTrack() {
      if (this.points.length) {
        this.points.push(this.points[0]);
      }
    }
  
    save() {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const filename = `track_${randomNumber}.json`;
      const trackData = {
        track: this.points.map(([x, y]) => ({ x, y })),
        streetDiameter: this.streetDiameter,
      };
      return { filename, trackData };
    }
  
    load(data) {
      this.points = data.track.map(point => [point.x, point.y]);
      this.streetDiameter = data.streetDiameter || 10;
    }
  
    clear() {
      this.points = [];
      this.drawing = false;
    }
  
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
  
  
    getDirection() {
      if (this.points.length > 1) {
        const [x1, y1] = this.points[0];
        const [x2, y2] = this.points[1];
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return angle;
      }
      return 0;
    }
  
    getCheckpoints() {
      const numCheckpoints = 4;
      const checkpointInterval = Math.floor(this.points.length / numCheckpoints);
      let checkpoints = [];
      for (let i = 0; i < numCheckpoints; i++) {
        checkpoints.push(this.points[i * checkpointInterval]);
      }
      return checkpoints;
    }
  
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
  