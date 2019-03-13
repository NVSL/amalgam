// ### Adafruit PCA9685

var Linuxduino = require("linuxduino");

const PCA9685_MODE1 = 0x0;
const PCA9685_PRESCALE = 0xFE;
const LED0_ON_L = 0x6;
const I2CADDR = 0x40;

var Wire = null;

function read8(addr) {
  Wire.beginTransmission(I2CADDR);
  Wire.write_byte(addr);
  Wire.endTransmission();

  Wire.requestFrom(I2CADDR, 1);
  return Wire.read();
}

function write8(addr, d) {
  Wire.beginTransmission(I2CADDR);
  Wire.write_byte(addr);
  Wire.write_byte(d);
  Wire.endTransmission();
}

function initWire(deviceI2CPort) {
  Wire = new Linuxduino.Wire();
  if (deviceI2CPort != null) {
    Wire.begin(deviceI2CPort);
  } else {
    console.error("i2cport not defined in CSS");
    return;
  }
}

function reset() {
  write8(PCA9685_MODE1, 0x80);
}

function setPWMFreq(freq) {

  freq *= 0.9;  // Correct for overshoot in the frequency setting (see issue #11).
  var prescaleval = 25000000;
  prescaleval /= 4096;
  prescaleval /= freq;
  prescaleval -= 1;

  var prescale = Math.floor(prescaleval + 0.5);
  
  var oldmode = read8(PCA9685_MODE1);
  var newmode = (oldmode&0x7F) | 0x10; // sleep
  write8(PCA9685_MODE1, newmode); // go to sleep
  write8(PCA9685_PRESCALE, prescale); // set the prescaler
  write8(PCA9685_MODE1, oldmode);
  write8(PCA9685_MODE1, oldmode | 0xa0);  //  This sets the MODE1 register to turn on auto increment.
}

function setPWM(num, on, off) {

  Wire.beginTransmission(I2CADDR);
  Wire.write_byte(LED0_ON_L+4*num);
  Wire.write_byte(on & 0x000000FF);
  Wire.write_byte((on & 0x0000FF00)>>8);
  Wire.write_byte(off & 0x000000FF);
  Wire.write_byte((off & 0x0000FF00)>>8);
  Wire.endTransmission();
}

module.exports.initWire = initWire;
module.exports.reset = reset;
module.exports.setPWMFreq = setPWMFreq;
module.exports.setPWM = setPWM;
