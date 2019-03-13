class TEST_PHYSCIAL_BUTTON extends HTMLElement {

	constructor () {
		super();
		this.gpio;
		this.hasOnClick = false;
	}

	readButton(milliseconds) {
  	var me = this;
	  this.timerfunc = setTimeout(function () {
	  	if (me.gpio != undefined) {
	  		if (me.hasOnClick == true) {
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
    console.log("Test Physical Button Ready");

    this.readButton(2000);
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

customElements.define('physical-button', TEST_PHYSCIAL_BUTTON);
