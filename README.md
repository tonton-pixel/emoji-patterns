# Emoji Patterns

## Available Patterns

The following patterns are generated using the information parsed from the Unicode emoji data files `emoji-data.txt`, `emoji-sequences.txt` and `emoji-zwj-sequences.txt`:

- Emoji
- Emoji_Component
- Emoji_Flag_Sequence
- Emoji_Keycap_Sequence
- Emoji_Modifier
- Emoji_Modifier_Base
- Emoji_Modifier_Sequence
- Emoji_Presentation
- Emoji_Tag_Sequence
- Emoji_ZWJ_Sequence
- Extended_Pictographic

These basic patterns are then used to generate two more complex compound patterns:

- Emoji_All
- Emoji_Keyboard

```javascript
const
{
    Emoji,
    Emoji_Component,
    Emoji_Flag_Sequence,
    Emoji_Keycap_Sequence,
    Emoji_Modifier,
    Emoji_Modifier_Base,
    Emoji_Modifier_Sequence,
    Emoji_Presentation,
    Emoji_Tag_Sequence,
    Emoji_ZWJ_Sequence,
    Extended_Pictographic
} = emojiPatterns;
````

```javascript
// Keyboard emoji only (fully-qualified)
emojiPatterns["Emoji_Keyboard"] = `(?:${Emoji_ZWJ_Sequence}|${Emoji_Keycap_Sequence}|${Emoji_Flag_Sequence}|${Emoji_Tag_Sequence}|${Emoji_Modifier_Base}${Emoji_Modifier}|${Emoji_Presentation}|${Emoji}\\u{FE0F})`;
// All emoji (U+FE0F optional)
emojiPatterns["Emoji_All"] = emojiPatterns["Emoji_Keyboard"].replace (/(\\u{FE0F}|\\uFE0F)/gi, "$1?");
```
Please note that the order of the basic patterns in the compound patterns is critical. Since a regular expression is greedy by default, the longest patterns must come first. The same strategy is also used when generating the **Emoji_ZWJ_Sequence** pattern itself.

## Installing

Switch to your *project* directory (`cd`) then run:

```bash
npm install emoji-patterns
```

## Testing

A basic test can be performed by running the following command line from the *package* directory:

```bash
npm test
```

## Examples

### Testing whether an emoji is fully-qualified (keyboard) or non-fully-qualified (display)

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiKeyboardRegex = new RegExp ('^' + emojiPatterns["Emoji_Keyboard"] + '$', 'u');
console.log (emojiKeyboardRegex.test ("❤️"));
// -> true
console.log (emojiKeyboardRegex.test ("❤"));
// -> false
```

### Extracting all emoji from a string

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
console.log (JSON.stringify ("AaĀā❤愛爱애💜".match (emojiAllRegex)));
// -> ["❤","💜"]
```

### Extracting all fully-qualified (keyboard) emoji from a string

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
const emojiKeyboardRegex = new RegExp ('^' + emojiPatterns["Emoji_Keyboard"] + '$', 'u');
let emojiList = "AaĀā❤愛爱애💜".match (emojiAllRegex);
if (emojiList)
{
    emojiList = emojiList.filter (emoji => emojiKeyboardRegex.test (emoji));
}
console.log (JSON.stringify (emojiList));
// -> ["💜"]
```

### Removing all emoji from a string

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
console.log (JSON.stringify ("AaĀā❤愛爱애💜".replace (emojiAllRegex, "")));
// -> "AaĀā愛爱애"
```

## Caveats

- The basic patterns strictly follow the information extracted from the data files. Therefore, the following characters are considered *Emoji* in the `emoji-data.txt` file, although they are omitted in the `emoji-test.txt` file, as well as in the CLDR annotation files:

    - 12 keycap bases: number sign '#', asterisk '*', digits '0' to '9'
    - 26 singleton regional indicators: '🇦' to '🇿'

- The regular expressions *must* include a 'u' flag, since the patterns make use of the new type of Unicode escape sequences: `\u{1F4A9}`.

- The two main regular expression patterns **Emoji_All** and **Emoji_Keyboard** are pretty big, around 40Kb...

## License

The MIT License (MIT).

Copyright © 2018 Michel MARIANI.
