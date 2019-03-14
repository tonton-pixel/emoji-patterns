//
const emojiPatterns = require ('.');
//
// List emoji pattern names
console.log (Object.keys (emojiPatterns).sort ());
console.log ("");
//
// Define a test string
const testString = "AaĀā❤愛爱❤️애💜 👳🏻👳🏼👳🏽👳🏾👳🏿 🇨🇦🇫🇷🇬🇧🇯🇵🇺🇸 👪⬌👨‍👩‍👦 💑⬌👩‍❤️‍👨 💏⬌👩‍❤️‍💋‍👨";
console.log (testString);
console.log ("");
//
// Create an "all emoji" regular expression
const emojiRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
//
// List all emoji in the test string
console.log (testString.match (emojiRegex));
console.log ("");
//
// Discard all emoji in the test string
console.log (testString.replace (emojiRegex, ""));
console.log ("");
//
