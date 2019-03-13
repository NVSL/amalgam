class PHYSICAL_BUTTON extends HTMLElement {
 constructor () { super(); this.gpio; }

  // Monitor attribute changes.
  static get observedAttributes() { 
    return ['onclick', 'gpio']; 
  }

  connectedCallback() {
    // Initialize GPIO
    Linuxduino.pinMode(this.gpio, Linuxduino.INPUT);
    // Start Reading GPIO
    setInterval( () => {
      // Call 'onclick' if physical button pressed
      if (Linuxduino.digitalRead(this.gpio)  == Linuxduino.HIGH) {
        this.click();
      }
    },200);
  }

 // Respond to attribute changes.
 attributeChangedCallback(attr, oldValue, newValue){
    if (attr == 'gpio') { 
      this.gpio = parseFloat(newValue); 
    }
 }

}