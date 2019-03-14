//
const emojiPatterns = require ('.');
//
const emojiPatternNames = Object.keys (emojiPatterns).sort ();
for (emojiPatternName of emojiPatternNames)
{
    console.log (`${emojiPatternName} [${emojiPatterns[emojiPatternName].length}]:`)
    console.log (emojiPatterns[emojiPatternName]);
    console.log ();
}
//
