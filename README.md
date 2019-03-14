# Emoji Patterns

## Description

This Node module returns a JSON-compatible object literal containing both basic and compound emoji pattern strings.

## Available Patterns

The following patterns are generated using the information parsed from the Unicode emoji data files `emoji-data.txt`, `emoji-sequences.txt` and `emoji-zwj-sequences.txt`:

- **Basic_Emoji**
- **Emoji**
- **Emoji_Component**
- **Emoji_Flag_Sequence**
- **Emoji_Keycap_Sequence**
- **Emoji_Modifier**
- **Emoji_Modifier_Base**
- **Emoji_Modifier_Sequence**
- **Emoji_Presentation**
- **Emoji_Tag_Sequence**
- **Emoji_ZWJ_Sequence**
- **Extended_Pictographic**

These basic patterns are then used to generate two more complex compound patterns:

- **Emoji_All**
- **Emoji_Keyboard**

```javascript
const
{
    Basic_Emoji,
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
// Keyboard emoji only (fully-qualified and components)
emojiPatterns["Emoji_Keyboard"] = `(?:${Emoji_ZWJ_Sequence}|${Emoji_Keycap_Sequence}|${Emoji_Flag_Sequence}|${Emoji_Tag_Sequence}|${Emoji_Modifier_Base}${Emoji_Modifier}|${Emoji_Presentation}|${Emoji}\\uFE0F)`;
// All emoji (U+FE0F optional)
emojiPatterns["Emoji_All"] = emojiPatterns["Emoji_Keyboard"].replace (/(\\u{FE0F}|\\uFE0F)/gi, '$1?');
```

### Notes

- The order of the basic patterns in the compound patterns is critical. Since a regular expression engine is *eager* and stops searching as soon as it finds a valid match (i.e., it always returns the leftmost match), the longest patterns must come first. The same strategy is also used when generating the **Emoji_ZWJ_Sequence** pattern itself.

- In the compound patterns, `${Emoji_Modifier_Base}${Emoji_Modifier}` can be replaced by `${Emoji_Modifier_Sequence}` which is strictly equivalent (but more verbose).

- Likewise, `${Emoji_Presentation}|${Emoji}\\uFE0F` could be replaced by `${Basic_Emoji}` (which should actually be called `${Basic_Emoji_Sequence}` for the sake of consistency), but the latter is more restrictive since it only contains the 5 skin tone and 4 hairstyle components, excluding the 12 keycap bases and the 26 singleton regional indicators.

- Providing patterns as strings instead of regular expressions does require the extra step of using `new RegExp ()` to actually make use of them, but it has two main advantages:

    - Flags can be set differently depending on how the patterns are used.

    - The patterns can be further modified before being turned into regular expressions; for instance, unwanted sub-patterns can be discarded by replacing them with an empty string, or the pattern can be embedded into a larger one. See examples below.

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

### Testing whether an emoji has a keyboard status or not

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
console.log (JSON.stringify ("AaĀā#*0❤🇦愛爱❤️애💜".match (emojiAllRegex)));
// -> ["#","*","0","❤","🇦","❤️","💜"]
```

### Extracting all emoji from a string, except keycap bases and singleton regional indicators

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllPattern = emojiPatterns["Emoji_All"];
const customPattern = emojiAllPattern.replace (/\\u0023\\u002A\\u0030-\\u0039|\\u\{1F1E6\}-\\u\{1F1FF\}/gi, '');
const customRegex = new RegExp (customPattern, 'gu');
console.log (JSON.stringify ("AaĀā#*0❤🇦愛爱❤️애💜".match (customRegex)));
// -> ["❤","❤️","💜"]
```

### Extracting all keyboard-status emoji from a string

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
const emojiKeyboardRegex = new RegExp ('^' + emojiPatterns["Emoji_Keyboard"] + '$', 'u');
let emojiList = "AaĀā#*0❤🇦愛爱❤️애💜".match (emojiAllRegex);
if (emojiList)
{
    emojiList = emojiList.filter (emoji => emojiKeyboardRegex.test (emoji));
}
console.log (JSON.stringify (emojiList));
// -> ["🇦","❤️","💜"]
```

### Removing all emoji from a string

```javascript
const emojiPatterns = require ('emoji-patterns');
const emojiAllRegex = new RegExp (emojiPatterns["Emoji_All"], 'gu');
console.log (JSON.stringify ("AaĀā#*0❤🇦愛爱❤️애💜".replace (emojiAllRegex, "")));
// -> "AaĀā愛爱애"
```

## Caveats

- The basic patterns strictly follow the information extracted from the data files. Therefore, the following characters are considered **Emoji** in the `emoji-data.txt` file, although they are omitted in the `emoji-test.txt` file, as well as in the CLDR annotation files provided in XML format:

    - 12 keycap bases: number sign '#', asterisk '*', digits '0' to '9'
    - 26 singleton regional indicators: '🇦' to '🇿'

- The regular expressions *must* include a 'u' flag, since the patterns make use of the new type of Unicode escape sequences: `\u{1F4A9}`.

- The two main regular expression patterns **Emoji_All** and **Emoji_Keyboard** are pretty big, around 42KB each...

## License

The MIT License (MIT).

Copyright © 2018-2019 Michel MARIANI.
