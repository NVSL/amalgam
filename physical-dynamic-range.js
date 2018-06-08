class PHYSCIAL_DYNAMIC_RANGE extends HTMLElement {

	constructor () {
		super();
		this.oninput;
		this.min;
		this.max;
		this.step;
		this.value;
		this.motora;
		this.motorb;
		this.touch;
    this.POTADCMIN = 19;
    this.POTADCMAX = 1084;
    this.FDW = 0;
    this.BKW = 1;
    this.STOP = 2;
    this.Wire = null;

    // Libraries
    this.ADC = require("Adafrui_ADS1015");
	}

  motor(pinOne, pinTwo, motorDir) {
    if (motorDir == 0) {
      Linuxduino.digitalWrite(pinOne, Linuxduino.HIGH);
      Linuxduino.digitalWrite(pinTwo, Linuxduino.LOW);
    } else if (motorDir == 1) {
      Linuxduino.digitalWrite(pinOne, Linuxduino.LOW);
      Linuxduino.digitalWrite(pinTwo, Linuxduino.HIGH);
    } else {
      Linuxduino.digitalWrite(pinOne, Linuxduino.LOW);
      Linuxduino.digitalWrite(pinTwo, Linuxduino.LOW);    
    }
  }

  setSliderPosition(sliderPos, pinMotorOne, pinMotorTwo, pinTouch, analogPin) {    
    var val = this.ADC.ads_readADC(this.Wire, analogPin);     // read the analog input
    //console.log("Init ADC: "+val+" POS:"+sliderPos);
    if (val < sliderPos-5 && !Linuxduino.digitalRead(pinTouch)) {
      this.motor(pinMotorOne, pinMotorTwo, this.FDW);
      while (this.ADC.ads_readADC(this.Wire, analogPin) < sliderPos && !Linuxduino.digitalRead(pinTouch)){
        console.log("Moving FDW"); 
      }
      this.motor(pinMotorOne, pinMotorTwo, this.STOP);
    } else if (val > sliderPos+5) {
      this.motor(pinMotorOne, pinMotorTwo, this.BKW);
      while (this.ADC.ads_readADC(this.Wire, analogPin) > sliderPos && !Linuxduino.digitalRead(pinTouch)){
       console.log("Moving BKW"); 
      }
      this.motor(pinMotorOne, pinMotorTwo, this.STOP);
    } else {
      console.log("Reached a Set Point");
    }
  }

  onlyFordwardSlider(sliderPos, pinMotorOne, pinMotorTwo, pinTouch, analogPin) {         
    var val = this.ADC.ads_readADC(this.Wire, analogPin);     // read the input pin
    //console.log("ADC: "+val+" POS:"+sliderPos);
    if (val < sliderPos && !Linuxduino.digitalRead(pinTouch)) {
      //console.log("value less than setPoint");
      this.motor(pinMotorOne, pinMotorTwo, this.FDW);
      while (this.ADC.ads_readADC(this.Wire, analogPin) < sliderPos && !Linuxduino.digitalRead(pinTouch)){
        console.log("Moving FDW"); 
      }
      this.motor(pinMotorOne, pinMotorTwo, this.STOP);
    }
  }

  checkNewSliderPosition(pinTouch, analogPin) {
    if (Linuxduino.digitalRead(pinTouch) == Linuxduino.HIGH) {
      return this.ADC.ads_readADC(this.Wire, analogPin);
    } else {
      return -1;
    }
  }

	map (x, in_min, in_max, out_min, out_max, step) {
	  var mapValue = (x - in_min) * (out_max - out_min) 
      / (in_max - in_min) + out_min;
	  return Math.round(mapValue/step)*step; // step the value
	}

	onSliderInput (milliseconds) {

  	// Timer
  	var me = this;
	  this.timerfunc = setTimeout(function () {

	  	if (typeof me.oninput === 'function' && 
  			me.min != undefined 		&&
  			me.max != undefined 		&&
  			me.step != undefined 		&&
  			me.value != undefined   &&
  			me.touch  != undefined ) {

  			var newPosition = me.checkNewSliderPosition(me.touch, 1);
  			if (newPosition != -1) {
  				// Map values
					var rangeValue = me.map(newPosition, me.POTADCMIN, 
              me.POTADCMAX, me.min, me.max, me.step);
    			me.value = rangeValue;
    			//console.log("New Slider Position: "+me.value);
    			me.oninput();
  			}
	  	}

      me.onSliderInput(milliseconds);
		}, milliseconds);
  }

  onSliderNewPosition(position, direction) {

  	if (this.min != undefined 				&&	
			this.max != undefined 			  &&
			this.step != undefined 				&&
			this.motora != undefined 	&&
			this.motorb != undefined 	&&
			this.touch  != undefined 	) {

		  var newPosition = this.map(position, this.min, this.max, 
          this.POTADCMIN, this.POTADCMAX, this.step);
			this.value = newPosition;
			if (direction == this.FDW) {
				//console.log("FDW New Position:"+newPosition);
				this.onlyFordwardSlider(this.value, this.motora, this.motorb, this.touch, 1);
			} else if (direction == this.BKW) {
				//console.log("BKW New Position:"+newPosition);
				this.setSliderPosition(this.value, this.motora, this.motorb, this.touch, 1);
			}
  	}

  }

	// Monitor the 'name' attribute for changes.
  static get observedAttributes() {
  	return ['min', 'max', 'step', 'value', 'motora', 'motorb', 'touch']; 
  }

  connectedCallback() {
    console.log("Dynamic Slider Ready");

    // Initialize I2C 
    this.Wire = new Linuxduino.Wire();
    this.Wire.begin("/dev/i2c-1"); // TODO: add a attribute for this and the adc number. 

    // Initialize gpios
    Linuxduino.pinMode(this.motora, Linuxduino.OUTPUT); //pinMotorOne
  	Linuxduino.pinMode(this.motorb, Linuxduino.OUTPUT); //pinMotorTwo
  	Linuxduino.pinMode(this.touch, Linuxduino.INPUT);   //pinTouch

  	var newPosition = this.map(this.value, this.min, this.max, 
        this.POTADCMIN, this.POTADCMAX, this.step);
  	this.setSliderPosition(newPosition, this.motora, this.motorb, this.touch, 1);
    this.onSliderInput(500);
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
    	if (newValue === oldValue) {
    		return;
    	} else if (parseFloat(newValue) > parseFloat(oldValue)) {
    		this.value = parseFloat(newValue);
    		this.onSliderNewPosition(this.value, this.FDW);
    	} else {
    		// Less than oldValue
    		this.value = parseFloat(newValue);
    		this.onSliderNewPosition(this.value, this.BKW);
    	}
    } else if (attr == 'motora') {
    	this.motora = parseInt(newValue);
    } else if (attr == 'motorb') {
    	this.motorb = parseInt(newValue);
    } else if (attr == 'touch') {
    	this.touch = parseInt(newValue);
    }
  }

}