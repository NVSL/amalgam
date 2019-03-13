// ### Adafruit RGB LEDS

var Linuxduino = require("linuxduino");

var SPI = null;
var settingsA = null;

function initSPI(deviceSPIPort) {
  settingsA = new Linuxduino.SPISettings(Linuxduino.SPI_CLOCK_DIV64, Linuxduino.MSBFIRST, Linuxduino.SPI_MODE1);
  SPI = new Linuxduino.SPI();
  SPI.begin(deviceSPIPort);
}

function setPixelColor (color) {
  if (SPI == null) return;

  var red = new Buffer(1);
  var green = new Buffer(1);
  var blue = new Buffer(1); 
  red = (color & 0x00FF0000) >> 16;
  green = (color & 0x0000FF00) >> 8;
  blue = (color & 0x000000FF);

  SPI.beginTransaction(settingsA);
  // Init pixel
  for (var i=0; i<4; i++) {
    SPI.transfer (0x00);
  }

  // ColorOne
  for (var i=0; i<6; i++) {
    SPI.transfer (0xFF);  // Pixel start
    SPI.transfer (red);   // Red
    SPI.transfer (blue);  // Blue
    SPI.transfer (green); // Green
  }

  for (var i=0; i<5; i++) {
    SPI.transfer (0xFF);
  }

  SPI.endTransaction();

}

//Function to convert hex format to a rgb color
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "0x" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

module.exports.initSPI = initSPI;
module.exports.setPixelColor = setPixelColor;
module.exports.rgb2hex = rgb2hex;
