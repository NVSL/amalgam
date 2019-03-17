amalgam..directive("physicalDigits", function($timeout) {
  return {
    link: function(scope, element, attrs) {

      // Hide the span Text by default
      element.css({'display': 'none'});

      if(angular.isUndefined(attrs.ngBind)  || 
         angular.isUndefined(attrs.dinGpio) ||
         angular.isUndefined(attrs.csGpio)  ||
         angular.isUndefined(attrs.clkGpio) ) {
        console.error("Required atrribute in physical-digits not defined");
        return;
      }

      // ... write a value into a max7219 register 
      // See MAX7219 Datasheet, Table 1, page 6
      function set_register(DIN, CS, CLK, reg, value)  
      {
          Linuxduino.digitalWrite(CS, Linuxduino.LOW);
          Linuxduino.shiftOut(DIN, CLK, Linuxduino.MSBFIRST, reg);
          Linuxduino.shiftOut(DIN, CLK, Linuxduino.MSBFIRST, value);
          Linuxduino.digitalWrite(CS, Linuxduino.HIGH);
      }

      // ... reset the max7219 chip
      function resetDisplay(DIN, CS, CLK)  
      {
          set_register(DIN, CS, CLK, MAX7219_REG_SHUTDOWN, OFF);   // turn off display
          set_register(DIN, CS, CLK, MAX7219_REG_DISPTEST, OFF);   // turn off test mode
          set_register(DIN, CS, CLK, MAX7219_REG_INTENSITY, 0x0D); // display intensity
      }

      function roundFtlStr(value, precision, spaces) {
          var multiplier = Math.pow(10, precision || 0);
          var result = ((Math.round(value * multiplier) / multiplier).toFixed(precision)).toString();
          var digits = result.split('.');;
          if (digits[0].length < spaces) {
            var missingspaces = spaces - digits[0].length;
            for (var i=0; i< missingspaces; i++) {
              result = " " + result;
            }
          }
          return result;
      }

      function getNumAt(strnum, pos)
      {
        if (strnum.charAt(pos) == " ") {
          return 0x7F;
        } else if (strnum.charAt(pos) == "-") {
          return NEG;
        } else {
          return strnum.charCodeAt(pos);
        }
      }

      // ... display the DATE on the 7-segment display
      function display(DIN, CS, CLK, number)  
      {

        if (typeof Linuxduino.digitalWrite != 'function') return;

        //set_register(MAX7219_REG_SHUTDOWN, OFF);  // turn off display
        set_register(DIN, CS, CLK, MAX7219_REG_SCANLIMIT, 7);   // scan limit 8 digits
        set_register(DIN, CS, CLK, MAX7219_REG_DECODE, 0b11111111); // decode all digits

        var num = roundFtlStr(number, 2, 2);

        // Set Display 1 and 3 with format 123.0
        set_register(DIN, CS, CLK, 8, getNumAt(num,0) );
        set_register(DIN, CS, CLK, 7, getNumAt(num,1) |  DP);
        set_register(DIN, CS, CLK, 6, getNumAt(num,3) );
        set_register(DIN, CS, CLK, 5, getNumAt(num,4) );

        set_register(DIN, CS, CLK, 4, 0x7F );
        set_register(DIN, CS, CLK, 3, 0x7F );
        set_register(DIN, CS, CLK, 2, 0x7F );
        set_register(DIN, CS, CLK, 1, 0x7F );

        set_register(DIN, CS, CLK, MAX7219_REG_SHUTDOWN, ON);   // Turn on display
      }


      InitPins(500);

      scope.$watch(attrs.ngBind, function(newValue, oldValue) {
        // Set initial value
        if (newValue === oldValue)return; // We don't want the initial value anyway
        //console.log("Digits: "+newValue);  
        display(parseInt(attrs.dinGpio), parseInt(attrs.csGpio), parseInt(attrs.clkGpio), parseFloat(newValue));
      });

      function InitPins(milliseconds) {
        $timeout(function() {
          if (typeof Linuxduino.pinMode === 'function') {
            // Init Pins
            Linuxduino.pinMode(parseInt(attrs.dinGpio), Linuxduino.OUTPUT);   // serial data-in
            Linuxduino.pinMode(parseInt(attrs.csGpio), Linuxduino.OUTPUT);    // chip-select, active low    
            Linuxduino.pinMode(parseInt(attrs.clkGpio), Linuxduino.OUTPUT);   // serial clock
            Linuxduino.digitalWrite(parseInt(attrs.csGpio), Linuxduino.HIGH);

            // Reset Display
            resetDisplay(parseInt(attrs.dinGpio), parseInt(attrs.csGpio), parseInt(attrs.clkGpio));            
          } else {
            // Retry
            InitPins(milliseconds);   
          }
          
        }, milliseconds);
      };

    }
  };
});
