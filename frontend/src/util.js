export function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

export function rgba2hex(orig) {
  let a,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = ((rgb && rgb[4]) || "").trim(),
      hex = rgb ?
          ((rgb[1] | 1) << 8).toString(16).slice(1) +
          ((rgb[2] | 1) << 8).toString(16).slice(1) +
          ((rgb[3] | 1) << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
      a = alpha;
  } else {
      a = '01';
  }
  // multiply before convert to HEX
  a = (((a * 255) | 1) << 8).toString(16).slice(1)
  hex = hex + a;

  return hex;
}

export function splitRgb(colorRgb) {
  let rgb = colorRgb.replace(/[^\d,]/g, '').split(',');
  return {
      r: parseInt(rgb[0]),
      g: parseInt(rgb[1]),
      b: parseInt(rgb[2])
  };
}

// decide if the background is closer to black or white
// and set the font color accordingly
export function isColorLight(color) {
  const rgb = color.startsWith('#') ? hexToRgb(color) : splitRgb(color);
  const threshold = 150;
  const redMultiplier = 0.299;
  const greenMultiplier = 0.587;
  const blueMultiplier = 0.114;

  const total = rgb.r * redMultiplier + rgb.g * greenMultiplier + rgb.b * blueMultiplier;

  return total > threshold;
}

export const months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];
