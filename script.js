// script.js
const img = new Image(); // used to load image from <input> and draw to canvas
const ctx = document.getElementById("user-image").getContext("2d");
const inputImage = document.getElementById("image-input");
const inputForm = document.getElementById("generate-meme");
const ButtonGroup = document.getElementById("button-group")
const clearButton = ButtonGroup.querySelector("button[type=reset]")
const readButton = ButtonGroup.querySelector("button[type=button]")
const submitButton = inputForm.querySelector("button[type=submit]")

const topText = document.getElementById("text-top");
const bottomText = document.getElementById("text-bottom");

const voiceSelect = document.getElementById("voice-selection");

const volumeGroup = document.getElementById("volume-group");
const volumeInput = volumeGroup.querySelector('input[type=range]');
const volumeIcon = volumeGroup.querySelector('img');

const textFontStyle = "30px Arial"
const borderTextGap = 50;
const topYCoord = borderTextGap;
const bottomYCoord = ctx.canvas.height - borderTextGap;


// Helper functions

function disableInput(disabled){
  topText.disabled = bottomText.disabled = inputImage.disabled = disabled // TODO: Ask if we should disable
}

function enableSelectedButtons(enableSubmit, enableGroup){
  for (let element of ButtonGroup.children){
    if (element instanceof HTMLButtonElement){
      element.disabled = !enableGroup;
    }
  }
  voiceSelect.disabled = !enableGroup;
  submitButton.disabled = !enableSubmit;
}


function populateVoiceList(){
  // Populates the voice list dropdown
  if (typeof speechSynthesis == 'undefined') return;

  let invalidOption = voiceSelect.querySelector('option[value=none]')
  if (invalidOption) voiceSelect.removeChild(invalidOption)

  let voices = speechSynthesis.getVoices();
  voices.forEach((voice, index) => {
    let option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.default) option.textContent += ' -- DEFAULT'
    option.setAttribute('data-lang', voice.lang);
    option.setAttribute('data-name', voice.name);
    option.setAttribute('value', index);
    voiceSelect.appendChild(option);
  })
}
populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}


// Event Listeners

volumeInput.addEventListener('change', () => {
  let volumeLevel = ""
  if (volumeInput.value > 66) { volumeLevel = 3 }
  else if (volumeInput.value > 33) { volumeLevel = 2 }
  else if (volumeInput.value > 0) { volumeLevel = 1 }
  else { volumeLevel = 0 }
  volumeIcon.src = `icons/volume-level-${volumeLevel}.svg`;
  volumeIcon.alt = `Volume Level ${volumeLevel};`
})

readButton.addEventListener('click', () => {
  console.log("Read Text Called", voiceSelect.value);
  let utterThis = new SpeechSynthesisUtterance(topText.value + ' ' + bottomText.value)
  utterThis.voice = speechSynthesis.getVoices()[voiceSelect.value]
  utterThis.volume = volumeInput.value / 100;
  window.speechSynthesis.speak(utterThis);
})

submitButton.addEventListener('click', (e) => {
  e.preventDefault();

  ctx.font = textFontStyle
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 8;
  ctx.fillStyle = 'white'
  ctx.textAlign = "center"

  const x = ctx.canvas.width / 2;
  
  ctx.strokeText(bottomText.value, x, bottomYCoord)
  ctx.fillText(bottomText.value, x, bottomYCoord)

  ctx.strokeText(topText.value, x, topYCoord)
  ctx.fillText(topText.value, x, topYCoord)

  enableSelectedButtons(false, true);
  disableInput(true);
})

clearButton.addEventListener('click', () => {
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
  enableSelectedButtons(true, false);
  topText.value = bottomText.value = ''
  inputImage.value = ''
  disableInput(false);
})

inputImage.addEventListener('change', () => {
  img.alt = inputImage.name
  img.src = window.URL.createObjectURL(inputImage.files[0])
})

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
  ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height)
  let dimensions = getDimmensions(ctx.canvas.width, ctx.canvas.height, img.width, img.height)

  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

