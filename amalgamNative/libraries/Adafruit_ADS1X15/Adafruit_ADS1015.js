// ### Adafruit ADS1X15

var Linuxduino = require("linuxduino");

const ADS1015_ADDRESS =                 (0x48);
const ADS1015_REG_CONFIG_CQUE_NONE =    (0x0003);  // Disable the comparator and put ALERT/RDY in high state (default)
const ADS1015_REG_CONFIG_CLAT_NONLAT =  (0x0000);  // Non-latching comparator (default)
const ADS1015_REG_CONFIG_CPOL_ACTVLOW = (0x0000);  // ALERT/RDY pin is low when active (default)
const ADS1015_REG_CONFIG_CMODE_TRAD =   (0x0000);  // Traditional comparator with hysteresis (default)
const ADS1015_REG_CONFIG_DR_1600SPS =   (0x0080);  // 1600 samples per second (default)
const ADS1015_REG_CONFIG_MODE_SINGLE =  (0x0100);  // Power-down single-shot mode (default)
const ADS1015_REG_CONFIG_PGA_6_144V =   (0x0000);  // +/-6.144V range = Gain 2/3

const ADS1015_REG_CONFIG_MUX_SINGLE_0 = (0x4000);  // Single-ended AIN0
const ADS1015_REG_CONFIG_MUX_SINGLE_1 = (0x5000);  // Single-ended AIN1
const ADS1015_REG_CONFIG_MUX_SINGLE_2 = (0x6000);  // Single-ended AIN2
const ADS1015_REG_CONFIG_MUX_SINGLE_3 = (0x7000);  // Single-ended AIN3

const ADS1015_REG_CONFIG_OS_SINGLE =    (0x8000);  // Write: Set to start a single-conversion
const ADS1015_REG_POINTER_CONFIG =      (0x01);
const ADS1015_REG_POINTER_CONVERT =     (0x00);

function writeRegister(Wire, i2cAddress, reg, value) {
  Wire.beginTransmission(i2cAddress);
  Wire.write_byte(reg);
  Wire.write_byte(value>>8);
  Wire.write_byte(value & 0xFF);
  Wire.endTransmission();
}

function readRegister(Wire, i2cAddress, reg) {
  Wire.beginTransmission(i2cAddress);
  Wire.write_byte(ADS1015_REG_POINTER_CONVERT);
  Wire.endTransmission();
  Wire.requestFrom(i2cAddress, 2);
  return ((Wire.read() << 8) | Wire.read());  
}

function ads_readADC(Wire, channel) {

	if (Wire == null) {
		console.warn("Wire is null");
		return 0;
	}

  if (channel > 3) {
    return 0;
  }
  
  // Start with default values
  var config = ADS1015_REG_CONFIG_CQUE_NONE    | // Disable the comparator (default val)
                    ADS1015_REG_CONFIG_CLAT_NONLAT  | // Non-latching (default val)
                    ADS1015_REG_CONFIG_CPOL_ACTVLOW | // Alert/Rdy active low   (default val)
                    ADS1015_REG_CONFIG_CMODE_TRAD   | // Traditional comparator (default val)
                    ADS1015_REG_CONFIG_DR_1600SPS   | // 1600 samples per second (default)
                    ADS1015_REG_CONFIG_MODE_SINGLE;   // Single-shot mode (default)

  // Set PGA/voltage range
  config |= ADS1015_REG_CONFIG_PGA_6_144V;

  // Set single-ended input channel
  switch (channel)
  {
    case (0):
      config |= ADS1015_REG_CONFIG_MUX_SINGLE_0;
      break;
    case (1):
      config |= ADS1015_REG_CONFIG_MUX_SINGLE_1;
      break;
    case (2):
      config |= ADS1015_REG_CONFIG_MUX_SINGLE_2;
      break;
    case (3):
      config |= ADS1015_REG_CONFIG_MUX_SINGLE_3;
      break;
  }

  // Set 'start single-conversion' bit
  config |= ADS1015_REG_CONFIG_OS_SINGLE;

  // Write config register to the ADC
  writeRegister(Wire, ADS1015_ADDRESS, ADS1015_REG_POINTER_CONFIG, config);

  // Wait for the conversion to complete
  Linuxduino.delay(1); // 1 ms

  // Read the conversion results
  // Shift 12-bit results right 4 bits for the ADS1015
  return readRegister(Wire, ADS1015_ADDRESS, ADS1015_REG_POINTER_CONVERT) >> 4;  
}


module.exports.ads_readADC = ads_readADC;
