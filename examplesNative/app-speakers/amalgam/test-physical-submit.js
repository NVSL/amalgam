class TEST_PHYSICAL_SUBMIT extends HTMLElement {

  constructor () {
    super();
    this.gpio;
    this.click;
  }

  upTo(el, tagName) {
    tagName = tagName.toLowerCase();
    while (el && el.parentNode) {
      el = el.parentNode;
      if (el.tagName && el.tagName.toLowerCase() == tagName) {
        return el;
      }
    }
    return null;
  }

  readButton(milliseconds) {
    var me = this;
    this.timerfunc = setTimeout(function () {

      console.log("Timer");

      if (me.gpio == undefined) {
        console.warn("No gpio pin defined");
        return;
      }

      var form = me.upTo(me, "form");
      if (form == null) {
        console.warn("No parent <form> tag found");
        return;
      }

      // Trigger submit and onsubmit if available
      console.log(form.onsubmit())
      if(form.onsubmit && form.onsubmit() === false) {
        me.readButton(milliseconds);
        return;
      } 
      if (typeof me.click === 'function') {
        console.log("click");
        me.click();
        form.submit();
        form.checkValidity();
      } else {
        form.submit();
      }
      me.readButton(milliseconds);

    }, milliseconds);
  }

  // Monitor the 'name' attribute for changes.
  static get observedAttributes() {
    return ['gpio']; 
  }

  connectedCallback() {
    console.log("Input Submit Ready");
    this.readButton(2000);
  }

  // Respond to attribute changes.
  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr == 'gpio') {
      this.gpio = parseFloat(newValue);
    }
  }

}

customElements.define('physical-submit', TEST_PHYSICAL_SUBMIT);