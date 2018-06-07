var Linuxduino = require("linuxduino");

Linuxduino.onRuntimeInitialized = function() {
  customElements.define('physical-button', PHYSCIAL_BUTTON);
}

class PHYSICAL_BUTTON extends HTMLElement {

 constructor () {
   super();
   this.gpio;
   this.hasOnClick = false;
 }

 readButton(milliseconds) {
   var me = this;
   this.timerfunc = setTimeout(function () {
     if (me.gpio != undefined) {
       var input = Linuxduino.digitalRead(me.gpio);
       if (me.hasOnClick == true && input == Linuxduino.HIGH) {
         // Call click function
         me.click();
       }
     }
      me.readButton(milliseconds);
   }, milliseconds);
  }

 // Monitor the 'name' attribute for changes.
  static get observedAttributes() {
   return ['onclick', 'gpio']; 
  }

  connectedCallback() {
    console.log("Physical Button Ready");

    // Initialize gpio
    Linuxduino.pinMode(this.gpio, Linuxduino.INPUT);
    // Start Reading gpio
    this.readButton(300);
  }

 // Respond to attribute changes.
 attributeChangedCallback(attr, oldValue, newValue) {
   if (attr == 'onclick') {
     this.hasOnClick = true;
    } else if (attr == 'gpio') {
     this.gpio = parseFloat(newValue);
    }
  }

}