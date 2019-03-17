amalgam.directive("physicalButton", function($timeout) {      
  return {
    scope: {
      gpio: '@gpio'
    },
    link: function(scope, element, attributes, iElm) {

      if(angular.isUndefined(scope.gpio)) {
        console.error("Required atrribute in physical-button not defined");
        return;
      }

      InitPins(500);

      scope.$watch('gpio', function(newValue, oldValue) {
        readButton(1000);
      });

      function readButton(milliseconds) {
        $timeout(function() {
          if (scope.gpio != undefined && 
            typeof Linuxduino.digitalRead === 'function') {
            var input = Linuxduino.digitalRead(parseInt(scope.gpio));
            if (input == Linuxduino.HIGH) {
              // Call click function
              angular.element(element).triggerHandler('click');
            }
          }
          readButton(milliseconds);
        }, milliseconds);
      };

      function InitPins(milliseconds) {
        $timeout(function() {
          if (typeof Linuxduino.pinMode === 'function') {
            Linuxduino.pinMode(parseInt(scope.gpio), Linuxduino.INPUT);   // serial data-in               
          } else {
            // Retry
            InitPins(milliseconds);                    
          }
        }, milliseconds);
      };

    }
  };
});