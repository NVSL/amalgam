class PHYSICAL_RGB_LED extends HTMLElement {

  constructor () {
    super(); 

    // Hard attributes
    this.spiport = null;

    // Libraries
    this.RGB = require("Adafruit_RGBLEDS");
  }
 
  // Monitor attribute changes.
  static get observedAttributes() {
    return ['style', 'spi-port']; 
  }

  connectedCallback() {
    // Initialize SPI
    this.RGB.initSPI(this.spiport);
  }
 
 // Respond to attribute changes.
 attributeChangedCallback(attr, oldValue, newValue){
  if (attr == 'style') {
    // Get background color
    var backgroundColor = window.getComputedStyle(this, null)["background-color"];
    // Effect the changes on the physical RGB
    this.RGB.setPixelColor(this.RGB.rgb2hex(backgroundColor));
  } else if (attr == 'spi-port') { 
    this.spiport = newValue; 
    console.log("THIS SPI PORT:"+this.spiport);
  }
 }
}