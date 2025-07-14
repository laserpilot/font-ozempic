// Load, parse, and display SVG 1.1 Fonts, as specified in
// https://www.w3.org/TR/SVG11/fonts.html
// Ideal for single-stroke SVG Fonts, such as those at:
// https://gitlab.com/oskay/svg-fonts
// https://github.com/Shriinivas/inkscapestrokefont
// https://github.com/isdat-type/Relief-SingleLine
// p5 parser/displayer by Golan Levin, December 2024. See: 
// https://github.com/golanlevin/p5-single-line-font-resources/


let mySvgFont;
function preload() {
  // mySvgFont = new SvgFont("single_line_svg_fonts/Hershey/HersheySans1.svg");
  //mySvgFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadability.svg");
  mySvgFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadabilityCyrillic.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadabilityItalic.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/Relief/ReliefSingleLine-Regular.svg");
}


function setup() {
  createCanvas(800, 400, SVG);
  let button = createButton('Save SVG');
  button.mousePressed(saveSvg);
}


function draw() {
  background("black");
  stroke("white");
  noFill();
              
  let sca = 48; 
  mySvgFont.drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 60, 80, sca);
  mySvgFont.drawString("abcdefghijklmnopqrstuvwxyz", 60, 130, sca);
  mySvgFont.drawString("1234567890", 60, 180, sca);
  mySvgFont.drawString("!@#$%^&*,.?/;:'-+_", 60,230, sca); 
  mySvgFont.drawString("()[]{}<>|\u00A9\u00AE\u20AC", 60, 280, sca);
  mySvgFont.drawString("АБВГД", 60, 330, sca);
  noLoop(); 
}

// Optional function for saving SVG canvas to file with unique timestamped name
function saveSvg() {
  save("test.svg");
}



