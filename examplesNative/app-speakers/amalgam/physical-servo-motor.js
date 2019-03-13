class PHYSICAL_SERVO_MOTOR extends HTMLElement {

  constructor () {
    super();
    this.angle = 0;

    // Hard attributes
    this.servochannel;
    this.i2cport = null;
    this.i2caddr = null;
    
    // Libraries
    this.PWM = require("Adafruit_PCA9685");

    // Others
    this.SERVOMIN =  125; // this is the 'minimum' pulse length count (out of 4096)
    this.SERVOMAX =  560; // this is the 'maximum' pulse length count (out of 4096)

  }

  // Get Angle of transform matrix
  getAngle(matrix) {
    var values = matrix.split('(')[1],
    values = values.split(')')[0],
    values = values.split(',');

    var a = values[0]; // 0.866025
    var b = values[1]; // 0.5

    return Math.round(Math.atan2(b, a) * (180/Math.PI));
  }

  // Monitor the 'name' attribute for changes.
  static get observedAttributes() {
    return ['style', 'servo-channel', 'i2c-port', 'i2c-addr']; 
  }

  connectedCallback() {

    // Initialize I2C
    this.PWM.initWire(this.i2cport, this.servochannel);

    // Reset Servos
    this.PWM.reset();
    this.PWM.setPWMFreq(60);  // Analog servos run at ~60 Hz updates

    console.log("SERVO Ready");
  }

  // Respond to attribute changes.
  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr == 'style') {

      if (this.servochannel == undefined) return;

      // Get Color in RGB
      var transform = window.getComputedStyle(this, null)["transform"];

      if (transform!= "" && transform!= "none") {
        // Style defined through CSS, thus we can't get this.style.

        var newAngle = this.getAngle(transform);
        if (newAngle != this.angle) {
          this.angle = newAngle;

          // Move Servo
          var angle = this.getAngle(transform);
          //console.log(this.getAngle(transform));
          var pulselen = Linuxduino.map(angle, 0, 180, this.SERVOMIN, this.SERVOMAX);
          this.PWM.setPWM(this.servochannel, 0, pulselen);

        }
        
      } else {
        console.log("No transform");
      }

    } else if (attr == 'servo-channel') {
      this.servochannel = parseFloat(newValue);
    } else if (attr == 'i2c-port') {
      this.i2cport = newValue;
    } else if (attr == 'i2c-addr') {
      this.i2caddr = parseFloat(newValue);
    }
  }
}