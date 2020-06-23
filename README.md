```Note: If you are having trouble running Amalgam, feel free to email me jgarzagu at ucsd.edu```
# Amalgam
Amalgam Core for translating html soft elements to Physical Web Components (hard elements) using Amalgam-enhanced CSS. 

## AmaglamNative & AmalgamAngular
**./amalgamNative** and **./amalgamAngular** both contain a compiler which translates soft elements to hard elements. **amalgamNative** has hard elements that interface with electrical components made using native web components whereas **amalgamAngular** has hard elements that use Angular directives for creating components. 
After the folder is added to the proyect and renamed as amalgam it can them be imported to a proyect:
```html
<link rel="import" href="amalgam/amalgam.html">
````

## Examples native
**./examplesNative** contains two examples, a Physical Youtube Player and a Physical Dancing Speaker. 

### > Physical Youtube Player
[Video](https://youtu.be/FK0AlLZHyIE)
![Physical Youtube Player 1](https://raw.githubusercontent.com/NVSL/amalgam/master/examplesNative/deviceImages/YoutubePlayer2.png)
Soft elements are translated into physical components to make a new device. 
![Physical Youtube Player 2](https://raw.githubusercontent.com/NVSL/amalgam/master/examplesNative/deviceImages/YoutubePlayer1.png)
Extra Required CSS:
```css
#playPause {
  hardware: physical-button(gpio:var(--gpio5));
}

#prev {
  hardware: physical-button(gpio:var(--gpio6));
}

#next {
  hardware: physical-button(gpio:var(--gpio12));
}

#slider {
  hardware: physical-pot(i2c-port:url("/dev/i2c-1"), i2c-addr:0x40);
}

#progressBar {
  width: 99%;
  hardware: physical-motorized-pot(motora:var(--gpio23), motorb:var(--gpio24),   
      touch:var(--gpio25), i2c-addr:0x48, i2c-port:url("/dev/i2c-1"));
}
```

### > Physical Dancing Speaker
[Video](https://youtu.be/UGUE7BeflxM)
![Physical Dancing Speaker](https://github.com/NVSL/amalgam/blob/master/examplesNative/deviceImages/DancingSpeaker2.png?raw=true)
HTML and CSS code:
```html
<link rel="import" href="amalgam/amalgam.html">
...
<button onclick="playPause()" id="playPause" 
  style="hardware: physical-button( gpio: var(--gpio5) )"> playPause 
</button>  
<button onclick="prevSong()" id="prev"
  style="hardware: physical-button( gpio: var(--gpio6) )"> Prev
</button>  
<button onclick="nextSong()" id="next"
  style="hardware: physical-button( gpio: var(--gpio12) )"> Next 
</button> 
<input type="range" min="0" max="1" step="0.1" value="1" id="slider"
  style="hardware: physical-pot( adc-channel: 1, i2c-port: url('/dev/i2c-1'),
  i2c-addr: 0x48"> 
<div class="rythm color1" 
  style="hardware: physical-rgb-led( spi-port: url('/dev/spidev0.0') )">
</div> 
<div class="rythm twist1"
  style="hardware: physical-servo-motor( servo-channel: 0, i2c-port: url('/dev/i2c-1' ), i2c-addr: 0x48 )">
</div> 
<div class="rythm twist2"
  style="hardware: physical-servo-motor( servo-channel: 3, i2c-port: url('/dev/i2c-1' ),  i2c-addr: 0x40 )">
</div> 
```

## Examples angular
**./examplesAngular** contain two different physical versions of a soft weight scale. Here is the soft version and the two versions compared side by side:
![All Weight Scales](https://raw.githubusercontent.com/NVSL/amalgam/master/examplesAngular/deviceImages/AllWeightScales1.png)

### > Soft Weight Scale   
A soft weight scale with a simulated load cell and simulated back text displat   
<img src="https://raw.githubusercontent.com/NVSL/amalgam/master/examplesAngular/deviceImages/VirtualWeightScale.PNG" alt="Soft Weight Scale" width="310"/>
<br>

### > Physical Weight Scale version 1
[Video](https://youtu.be/XGMce_g8gSM)
Load cell and back display added   
<img src="https://raw.githubusercontent.com/NVSL/amalgam/master/examplesAngular/deviceImages/WeightScaleVer1.jpg" alt="Physical Weight Scale version 1" width="330"/>
<img src="https://raw.githubusercontent.com/NVSL/amalgam/master/examplesAngular/deviceImages/WeightScaleVer1_back.jpg" alt="Physical Weight Scale version 1 back" width="350"/>
<br>
Extra Required CSS:
```css
#lcdDisplay {
  hardware: physical-span;
}

#weightSensor {
	hardware: physical-weight-sensor;
}
```
*Note: hard elements here use default pin and ports assigments

### > Physical Weight Scale version 2
<img src="https://raw.githubusercontent.com/NVSL/amalgam/master/examplesAngular/deviceImages/WeightScaleVer2.jpg" alt="Physical Weight Scale version 2" width="350"/>   
Extra Required CSS: 

```css
#lcdDisplay {
  hardware: physical-span;
}

#weightSensor {
	hardware: physical-weight-sensor;
}

#weightDigits {
	hardware: physical-digits(din-gpio:17, cs-gpio:27 clk-gpio:22);
}

#priceDigits {
	hardware: physical-digits(din-gpio:5, cs-gpio:6 clk-gpio:13);
}

#totalDigits {
	hardware: physical-digits(din-gpio:16, cs-gpio:20 clk-gpio:21);
}

#buttonZero {
	hardware: physical-button(gpio:19);
}

#buttonTare {
	hardware: physical-button(gpio:26);
}

/*Remove other content */
#scale {
	display: none;
}

.container {
	display: none;
}

.sidenav {
	display: none !important;;
}
```
