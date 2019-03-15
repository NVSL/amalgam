amalgam.directive("physicalWeightSensor", function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attributes, ngModel) {

      // Hide by default
      element.css({'display': 'none'});

      // ## Linuxduino Load Cell Firmware
      const DOUT = 2;
      const CLK  = 3;
      const CALIBRATION_FACTOR = 21680;
      var OFFSET = 0;

      function shiftIn(dataPin, clockPin) {
        var value = 0;
        var i;

        for (i = 0; i < 8; ++i) {
          Linuxduino.digitalWrite(clockPin, Linuxduino.HIGH);
          Linuxduino.digitalWrite(clockPin, Linuxduino.LOW);
          value |= Linuxduino.digitalRead(dataPin) << (7 - i);
        }                                   
        return value;
      }

      function scale_init (pin_data, pin_clk) {
        Linuxduino.pinMode(pin_clk, Linuxduino.OUTPUT);
        Linuxduino.pinMode(pin_data, Linuxduino.INPUT);
        Linuxduino.digitalWrite(pin_clk, Linuxduino.LOW);
      }

      function scale_read(pin_data, pin_clk) {
        
        var value = 0;
        var data = [0,0,0];
        var filler = 0x00;

        while ( !(Linuxduino.digitalRead(pin_data) == 0) );

        // pulse the clock pin 24 times to read the data
        data[2] = shiftIn(pin_data, pin_clk);
        data[1] = shiftIn(pin_data, pin_clk);
        data[0] = shiftIn(pin_data, pin_clk);

        // set the channel and the gain factor for the next reading using the clock pin
        var GAIN = 1; // It can be 1, 2 or 3
        for (var i = 0; i < GAIN; i++) {
          Linuxduino.digitalWrite(pin_clk, Linuxduino.HIGH);
          Linuxduino.digitalWrite(pin_clk, Linuxduino.LOW);
        }

        // Return -1 if any of the values is not correct (In case of node)
        if (data[0] == 255 || data[1] == 255 || data[2] == 255) {
          return -1;
        }

        // Replicate the most significant bit to pad out a 32-bit signed integer
        if (data[2] & 0x80) {
          filler = 0xFF;
        } else {
          filler = 0x00;
        }

        // Construct a 32-bit signed integer
        value = filler << 24
            | data[2] << 16
            | data[1] << 8
            | data[0];

        return value;
      }

      function scale_read_average (pin_data, pin_clk, times) {
        var sum = 0;
        for (var i = 0; i < times; i++) {
          var value = scale_read(pin_data, pin_clk);
          if (value == -1) {
            i--; // Try again
            //console.log("Skip");
          }
          sum += value;
        }
          
        return sum / times;
      }

      function scale_get_offset (pin_data, pin_clk) {
        return scale_read_average(pin_data, pin_clk, 10);
      }

      function scale_get_weight(pin_data, pin_clk, offset, scale) {
        var raw_weight = (scale_read_average(pin_data, pin_clk, 2) - offset);
        return (raw_weight / scale);
      }

      // ## Load Cell INIT
      scale_init (DOUT,CLK);
      // Assuming no weight at the begining
      OFFSET = scale_get_offset (DOUT, CLK);
      console.log("OFFSET = " + OFFSET);

      window.setInterval(function () {

        var weight = scale_get_weight(DOUT, CLK, OFFSET, CALIBRATION_FACTOR); //Math.random();
        ngModel.$setViewValue(weight);
        ngModel.$render();
        
      }, 500);
    }
  };
});
