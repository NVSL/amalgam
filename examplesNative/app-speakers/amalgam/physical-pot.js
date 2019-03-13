class PHYSICAL_POT extends HTMLElement {

	constructor () {
		super();
		this.oninput;
		this.min;
		this.max;
		this.step;
		this.value;
		this.POTADCMIN = 19;
		this.POTADCMAX = 1084;

		// Hard attributes
		this.Wire = null;
		this.adcChannel = 0;
		this.i2cport = null;
		this.i2caddr = null;

		// Libraries
		this.ADC = require("Adafrui_ADS1015");
	}

	map (x, in_min, in_max, out_min, out_max, step) {
	  var mapValue = (x - in_min) * (out_max - out_min) 
	  	/ (in_max - in_min) + out_min;
	  return Math.round(mapValue/step)*step; // step the value
	}

	readADC (milliseconds) {

  	// Timer
  	var me = this;
	  this.timerfunc = setTimeout(function () {

	  	if (typeof me.oninput === 'function' && 
	  			me.min != undefined 		&&
	  			me.max != undefined 		&&
	  			me.step != undefined 		&&
	  			me.value != undefined ) {

	  		// Read adc
 				var adcValue = me.ADC.ads_readADC(me.Wire, me.adcChannel);

        // To prevent adc speaks when in off or cero
        if (adcValue > me.POTADCMAX) adcValue = me.POTADCMAX;
        if (adcValue < me.POTADCMIN) adcValue = me.POTADCMIN;

 				// Map values
 				var rangeValue = me.map(adcValue, me.POTADCMIN, 
 					me.POTADCMAX, me.min, me.max, me.step);

				me.value = rangeValue;
  			me.oninput();

	  	}

      me.readADC(milliseconds);
		}, milliseconds);
  }

	// Monitor the 'name' attribute for changes.
  static get observedAttributes() {
  	return ['min', 'max', 'step', 'value', 'adc-channel', 'i2c-port', 'i2c-addr']; 
  }

  connectedCallback() {
    console.log("Static Slider Ready");

    // Initialize I2C
    this.Wire = new Linuxduino.Wire();
    if (this.i2cport != null)
    	this.Wire.begin(this.i2cport);
    else {
    	console.error("i2cport not defined in CSS");
    	return;
    }

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
    } else if (attr == 'i2c-port') {
    	this.i2cport = newValue;
    } else if (attr == 'i2c-addr') {
    	this.i2caddr = parseFloat(newValue);
    } else if (attr == 'adc-channel') {
    	this.adcChannel = parseFloat(newValue);
    }
  }

}
