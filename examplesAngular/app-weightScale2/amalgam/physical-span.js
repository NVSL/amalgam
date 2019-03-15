amalgam.directive("physicalSpan", function() {
  return {
      link: function(scope, element, attrs) {

        if(angular.isUndefined(attrs.ngBind)) {
          return;
        }

        // Hide the span Text by default
        element.css({'display': 'none'});

        // ## Linuxduino Serial LCD Firmware
        var Serial = null;

        function writeLCDText (Serial, text) {

          if (Serial == null) {
            console.log("Serial is null");
            return;
          }

          // Clear Display
          Serial.write_byte(0xFE);  // send the special command
          Serial.write_byte(0x01);  // send the clear screen command

          var data = text.split("\n");

          if (data[0] != undefined) {
            // Move cursor to beginning of first line
            Serial.write_byte(254); 
            Serial.write_byte(128);
            Serial.write(data[0]);
          }

          if (data[1] != undefined) {
            // Move cursor to beginning of the second line
            Serial.write_byte(254); 
            Serial.write_byte(192);
            Serial.write(data[1]);
          }

        }

        // ## Serial INIT
        Serial =  new Linuxduino.Serial();
        Serial.begin("/dev/ttyAMA0", 9600);
        writeLCDText(Serial, ""); // Clear Display

        scope.$watch(attrs.ngBind, function(newValue, oldValue) {
          // Set initial value
          if (newValue === oldValue) return; // We don't want the initial value anyway
          //console.log("LCD: "+newValue);
          writeLCDText(Serial, newValue.toString());

        });
      }
  };
});
