//
const fs = require ('fs');
const path = require ('path');
//
function unicodeEscape (num)
{
    let hex = num.toString (16).toUpperCase ();
    return (num > 0xFFFF) ? `\\u{${hex}}` : `\\u${('000' + hex).slice (-4)}`;
}
//
function parseCodePoints (filename, result)
{
    let patterns = { };
    let lines = fs.readFileSync (path.join (__dirname, 'data', filename), { encoding: 'utf8' }).split ('\n');
    for (let line of lines)
    {
        if (line && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let range = fields[0].trim ();
            let type = fields[1].trim ();
            let found = range.match (/^([0-9a-fA-F]{4,})(?:\.\.([0-9a-fA-F]{4,}))?$/);
            if (found)
            {
                let first = found[1];
                let last = found[2] || found[1];
                if (!(type in patterns))
                {
                    patterns[type] = [ ];
                }
                for (let codePoint = parseInt (first, 16); codePoint <= parseInt (last, 16); codePoint++)
                {
                    patterns[type].push (codePoint);
                }
            }
        }
    }
    for (let pattern in patterns)
    {
        let codePoints = patterns[pattern];
        let set = [ ];
        let first;
        let last;
        codePoints.forEach
        (
            (codePoint) =>
            {
                if (!first)
                {
                    first = codePoint;
                    last = codePoint;
                }
                else
                {
                    if (codePoint === (last + 1))
                    {
                        last = codePoint;
                    }
                    else
                    {
                        set.push (unicodeEscape (first) + ((last !== first) ? '-' + unicodeEscape (last) : ''));
                        first = codePoint;
                        last = codePoint;
                    }
                }
            }
        );
        if (first)
        {
            set.push (unicodeEscape (first) + ((last !== first) ? '-' + unicodeEscape (last) : ''));
        }
        result[pattern] = '[' + set.join ('') + ']';
    }
}
//
function parseSequences (filename, result)
{
    let patterns = { };
    let lines = fs.readFileSync (path.join (__dirname, 'data', filename), { encoding: 'utf8' }).split ('\n');
    for (let line of lines)
    {
        if (line && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let type = fields[1].trim ();
            if (!(type in patterns))
            {
                patterns[type] = [ ];
            }
            let range = fields[0].trim ().match (/^([0-9a-fA-F]{4,})(?:\.\.([0-9a-fA-F]{4,}))?$/);
            if (range)
            {
                let first = range[1];
                let last = range[2] || range[1];
                for (let codePoint = parseInt (first, 16); codePoint <= parseInt (last, 16); codePoint++)
                {
                    patterns[type].push (String.fromCodePoint (codePoint));
                }
            }
            else
            {
                let emoji = fields[0].trim ().split (' ').map (codePoint => String.fromCodePoint (parseInt (codePoint, 16))).join ('');
                patterns[type].push (emoji);
            }
        }
    }
    for (let pattern in patterns)
    {
        let emojiCodes = patterns[pattern].sort ().reverse ().map
        (
            emoji => Array.from (emoji).map (char => unicodeEscape (char.codePointAt (0))).join ('')
        );
        result[pattern] = '(?:' + emojiCodes.join ('|') + ')';
    }
}
//
// https://www.unicode.org/reports/tr51/
//
// Copy of https://unicode.org/Public/emoji/12.0/emoji-data.txt
// Copy of https://unicode.org/Public/emoji/12.0/emoji-sequences.txt
// Copy of https://unicode.org/Public/emoji/12.0/emoji-zwj-sequences.txt
//
function parseData ()
{
    let result = { };
    parseCodePoints ('emoji-data.txt', result);
    parseSequences ('emoji-sequences.txt', result);
    parseSequences ('emoji-zwj-sequences.txt', result);
    return result;
}
//
let emojiPatterns = parseData ();
//
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
//
// Keyboard emoji only (fully-qualified and components)
emojiPatterns["Emoji_Keyboard"] = `(?:${Emoji_ZWJ_Sequence}|${Emoji_Keycap_Sequence}|${Emoji_Flag_Sequence}|${Emoji_Tag_Sequence}|${Emoji_Modifier_Base}${Emoji_Modifier}|${Emoji_Presentation}|${Emoji}\\uFE0F)`;
// All emoji (U+FE0F optional)
emojiPatterns["Emoji_All"] = emojiPatterns["Emoji_Keyboard"].replace (/(\\u{FE0F}|\\uFE0F)/gi, '$1?');
//
module.exports = emojiPatterns;
//
