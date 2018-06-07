var Linuxduino = require("linuxduino");

Linuxduino.onRuntimeInitialized = function() {
  customElements.define('physical-static-range', PHYSCIAL_STATIC_RANGE);
}

class PHYSCIAL_STATIC_RANGE extends HTMLElement {

	constructor () {
		super();
		this.oninput;
		this.min;
		this.max;
		this.step;
		this.value;
	}

	map (x, in_min, in_max, out_min, out_max, step) {
	  var mapValue = (x - in_min) * (out_max - out_min) 
	  	/ (in_max - in_min) + out_min;
	  return Math.round(mapValue/step)*step; // step the value
	}

	readADC (milliseconds) {

  	// Pot Adc parameters
  	var adcMin = 0;
  	var adcMax = 1098;

  	// Timer
  	var me = this;
	  this.timerfunc = setTimeout(function () {

	  	if (typeof me.oninput === 'function' && 
	  			me.min != undefined 		&&
	  			me.max != undefined 		&&
	  			me.step != undefined 		&&
	  			me.value != undefined ) {

	  		// Read adc
 				var adcValue = ads_readADC(Wire, 0);

        // To prevent adc speaks when in off or cero
        if (adcValue > adcMax) adcValue = 0;

 				// Map values
 				var rangeValue = me.map(adcValue, adcMin, 
 					adcMax, me.min, me.max, me.step);

 				// If pot value changes
 				//if (rangeValue != me.value) {
 					me.value = rangeValue;
 					// Call physical input changed
	  			me.oninput();
 				//}

	  	}

      me.readADC(milliseconds);
		}, milliseconds);
  }

	// Monitor the 'name' attribute for changes.
  static get observedAttributes() {
  	return ['min', 'max', 'step', 'value']; 
  }

  connectedCallback() {
    console.log("Static Slider Ready");

    // Initialize I2C 
    Wire = new Linuxduino.Wire();
    Wire.begin("/dev/i2c-1"); // TODO: add a attribute for this and the adc number. 

    this.readADC(1000);
  }

	// Respond to attribute changes.
	attributeChangedCallback(attr, oldValue, newValue) {

		if (attr == 'min') {
			this.min = parseFloat(newValue);
    } else if (attr == 'max') {
    	this.max = parseFloat(newValue);
    } else if (attr == 'step') {
    	this.step = parseFloat(newValue);
    } else if (attr == 'value') {
    	this.value = parseFloat(newValue);
    	// Not supported as it shoud behave, there is no way to set a potentiometer to a specific value at start
    }
  }

}