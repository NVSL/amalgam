// ###
// ###  Amalgam Compiler
// ###

var css = require('css');
var fs = require('fs');
var $ = require('jquery');

// Start Amalgam Compiler on Load
window.onload =  function () {
  compileToPhysicalHTML();
}

// Translate HTML to Physical HTML from CSS
function compileToPhysicalHTML () {
  // Get Physical Components
  var physcialCSSDic = getPhysicalHTML();
  for ([selector, physicalHTML] of Object.entries(physcialCSSDic)) {
    console.log(physicalHTML)
    // Translate
    $(selector).replaceWith(physicalHTML);
  }
}


// Parses CSS files to look for physical CSS selectors
function getPhysicalHTML() {
  var dicCSSVars = {};
  var dicPhyComp = {};
  var dicPhyCSS  = {};
  
  // For each CSS File in the DOM 
  // get CSS variables and Physical Components
  for (var i=0; i<document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    //console.log(sheet);
    if (sheet.href == null) break;
    var cssFile = sheet.href.replace("file://","");
    var fullDic = parseCSS(cssFile);
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
    if (sheet.href == null) break;
    var cssFile = sheet.href.replace("file://","");
    var fullDic = parseCSS(cssFile);
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


function parseCSS(cssFilePath) {
  cssFile = readFile(cssFilePath);
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
         var res = value.replace(/\)/g,"").replace(/var\(/g,"").split("(");
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


function readFile(file) {
  try {
    var src = fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Error compiling, file not found:'+file);
    } else {
      throw err;
    }
    return undefined;
  }
  // normalize line endings
  src = src.replace(/\r\n/, '\n');
  // remove trailing newline
  src = src.replace(/\n$/, '');

  return src;
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


module.exports.compileToPhysicalHTML = compileToPhysicalHTML;
module.exports.getPhysicalHTML = getPhysicalHTML;
