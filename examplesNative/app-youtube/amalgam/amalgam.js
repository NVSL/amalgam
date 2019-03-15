// ###
// ###  Amalgam Compiler
// ###


var css = null;
var $ = null;

// Start Amalgam Compiler on Load
document.addEventListener("DOMContentLoaded", function(event) {
  if (typeof require != 'function') return;
  css = require('css');
  $ = require('jquery');
  console.log("Compiling CSS");
  compileToPhysicalHTML();
});

// Translate HTML to Physical HTML from CSS
async function compileToPhysicalHTML () {
  // Get Physical Components
  var physcialCSSDic = await getPhysicalHTML();
  for ([selector, physicalHTML] of Object.entries(physcialCSSDic)) {

    // Find all javascript user defiend events in the old tag
    var userEvents = $(selector)[0]; // Get old tag
    var dicUserEvents = {};
    for (var key in userEvents) {
      if (typeof userEvents[key] === 'function' 
        && !userEvents[key].toString().includes("[native code]") 
        && !(key in $(selector)[0].attributes)) {
        // Javacript user defined javascritp events
        //console.log(key+":"+userEvents[key]);
        dicUserEvents[key] = userEvents[key];
      }
    }

    // Replace the old tag with the new physical tag
    $(selector).replaceWith(physicalHTML);

    // Copy javascript user defined event to the new physical tag
    for ([attribute, value] of Object.entries(dicUserEvents)) {
      $(selector)[0][attribute]=value;
    }

    // Print new tag
    console.log(physicalHTML)

  }

  console.log("Compiling END");
}


// Parses CSS files to look for physical CSS selectors
async function getPhysicalHTML() {
  var dicCSSVars = {};
  var dicPhyComp = {};
  var dicPhyCSS  = {};
  
  // For each CSS File in the DOM 
  // get CSS variables and Physical Components
  for (var i=0; i<document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.href == null) continue;
    var cssFile = sheet.href.replace("file://","");
    var fullDic = await parseCSS(cssFile);
    if (fullDic == null) {
      console.error("Amlagam compiler Failed");
      return;
    }
    dicCSSVars = Object.assign({}, dicCSSVars, fullDic[0]);
    dicPhyComp = Object.assign({}, dicPhyComp, fullDic[1]);
  }

  // For each CSS File in the folder board_pinout
  // get CSS variables and Physical Components
  // TODO: Make a function for this
  var importDocument = document.querySelector('link[rel="import"]').import;
  for (var i=0; i<importDocument.styleSheets.length; i++) {
    var sheet = importDocument.styleSheets[i];
    //console.log(sheet);
    if (sheet.href == null) continue;
    var cssFile = sheet.href.replace("file://","");
    var fullDic = await parseCSS(cssFile);
    if (fullDic == null) {
      console.error("Amlagam compiler Failed");
      return;
    }
    dicCSSVars = Object.assign({}, dicCSSVars, fullDic[0]);
    dicPhyComp = Object.assign({}, dicPhyComp, fullDic[1]);
  }

  // Add Physical HTML CSS variables (e.g --GPIO1 = 1)
  for ([selector, physicalHTML] of Object.entries(dicPhyComp)) {
    // If a Physical HTML has a CSS Variable replace it
    for (const [cssvar, value] of Object.entries(dicCSSVars)) {
      if(physicalHTML.includes(cssvar)) {
        physicalHTML = physicalHTML.replace(cssvar,value);
      }
    }
    dicPhyCSS[selector] = physicalHTML;
  }
  return dicPhyCSS;
}


async function parseCSS(cssFilePath) {
  let cssFile = await $.get(cssFilePath);
  if (cssFile == undefined) return null;
  var ast = css.parse(cssFile, { source: cssFile });
  var cssstring = css.stringify(ast, { sourcemap: true });

  // Change web components to physical web components
  var physicalVars = {};
  var physicalComp = {};

  totalrules = (ast["stylesheet"]["rules"]).length;
  for (var i=0; i< totalrules; i++) {

    if (ast["stylesheet"]["rules"][i]["selectors"] == undefined) continue;
    var selector = ast["stylesheet"]["rules"][i]["selectors"][0];
    var totaldeclarations = (ast["stylesheet"]["rules"][i]["declarations"]).length;


    var isPhysical = false;
    var physicalComponentName = '';
    var physicalAttributes = '';

    for (var n=0; n< totaldeclarations; n++) {
      var property = ast["stylesheet"]["rules"][i]["declarations"][n]["property"];
      var value = ast["stylesheet"]["rules"][i]["declarations"][n]["value"];

      //console.log(property+":"+value);

      // If there is no properties, skip.
      if (property == undefined) continue;

      if (property == "hardware") {
         isPhysical = true;
         var res = value.replace(/\)/g,"").replace(/var\(/g,"").replace(/url\(/g,"").replace(/\"/g,"").split("(");
         if (res.length < 1) {
            console.error("Error compiling css physical property: "+
              property+":"+value + ", wrong format");
            return null;
         } else {
            // Physical HTML tag name
            physicalComponentName = res[0];
            // Physical HTML attributes
            if (res.length == 2) {
              attributes = res[1].split(",");
              //console.log(attributes);
              for (var x=0; x < attributes.length; x++) {
                var attr = attributes[x].split(":");
                if (attr.length != 2) {
                  console.error("Error compiling "+attributes[x]+" of css physical property: "+
                    property+":"+value);
                  return null;
                } else {
                  var attrName  = attr[0];
                  var attrValue = attr[1];
                  physicalAttributes = physicalAttributes+" "+attrName+"="+"'"+attrValue+"'";
                }
              }
            }
            // console.log(physicalComponentName);
            // console.log(physicalAttributes);
         }
      }

      if(property.includes("--")) {
        physicalVars[property] = value;
      }

    }

    // Add Physical Components to the dictoniary
    if (isPhysical == true) {
      // Remove web component with physical web component
      var oldAttributes = getAllAttributes(selector);
      physicalComp[selector] = "<"+physicalComponentName+
        oldAttributes+physicalAttributes+"></"+physicalComponentName+">";
      //console.log(physicalComp);
    }
  }

  return [physicalVars, physicalComp];
}

function getAllAttributes(selector) {
  var attributes = '';
  $(selector).each(function() {
     $.each(this.attributes, function() {
      // this.attributes is not a plain object, but an array
      // of attribute nodes, which contain both the name and value
      if(this.specified) {
        attributes = attributes + " " + this.name+"="+"'"+this.value+"'";
      }
    });
  });
  return attributes;
}