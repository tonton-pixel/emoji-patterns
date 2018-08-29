//
const fs = require ('fs');
const path = require ('path');
//
// https://www.unicode.org/reports/tr51/
//
// Copy of https://unicode.org/Public/emoji/11.0/emoji-data.txt
// Copy of https://unicode.org/Public/emoji/11.0/emoji-sequences.txt
// Copy of https://unicode.org/Public/emoji/11.0/emoji-zwj-sequences.txt
//
function parseData ()
{
    let result = { };
    //
    let lines;
    //
    let dataPatterns = { };
    //
    lines = fs.readFileSync (path.join (__dirname, 'data', 'emoji-data.txt'), { encoding: 'utf8' }).split ('\n');
    for (let line of lines)
    {
        if ((line) && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let range = fields[0].trim ();
            let property = fields[1].trim ();
            let found = range.match (/^([0-9a-fA-F]{4,})(?:\.\.([0-9a-fA-F]{4,}))?$/);
            if (found)
            {
                let first = found[1];
                let last = found[2] || found[1];
                if (!(property in dataPatterns))
                {
                    dataPatterns[property] = [ ];
                }
                for (let code = parseInt (first, 16); code <= parseInt (last, 16); code++)
                {
                    dataPatterns[property].push (code);
                }
            }
        }
    }
    //
    function unicodeEscape (num)
    {
        let hex = num.toString (16).toUpperCase ();
        return (num > 0xFFFF) ? `\\u{${hex}}` : `\\u${('000' + hex).slice (-4)}`;
    }
    //
    for (let pattern in dataPatterns)
    {
        let codes = dataPatterns[pattern];
        let set = [ ];
        let first;
        let last;
        codes.forEach
        (
            (code) =>
            {
                if (!first)
                {
                    first = code;
                    last = code;
                }
                else
                {
                    if (code === (last + 1))
                    {
                        last = code;
                    }
                    else
                    {
                        set.push (unicodeEscape (first) + ((last !== first) ? '-' + unicodeEscape (last) : ''));
                        first = code;
                        last = code;
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
    //
    let sequencesPatterns = { };
    //
    lines = fs.readFileSync (path.join (__dirname, 'data', 'emoji-sequences.txt'), { encoding: 'utf8' }).split ('\n');
    for (let line of lines)
    {
        if ((line) && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let emoji = fields[0].trim ().split (' ').map (codePoint => String.fromCodePoint (parseInt (codePoint, 16))).join ('');
            let type = fields[1].trim ();
            if (!(type in sequencesPatterns))
            {
                sequencesPatterns[type] = [ ];
            }
            sequencesPatterns[type].push (emoji);
        }
    }
    //
    for (let pattern in sequencesPatterns)
    {
        let emojiCodes = sequencesPatterns[pattern].map
        (
            emoji => Array.from (emoji).map (char => unicodeEscape (char.codePointAt (0))).join ('')
        );
        result[pattern] = '(?:' + emojiCodes.join ('|') + ')';
    }
    //
    let zwjSequencesPatterns = { };
    //
    lines = fs.readFileSync (path.join (__dirname, 'data', 'emoji-zwj-sequences.txt'), { encoding: 'utf8' }).split ('\n');
    for (let line of lines)
    {
        if ((line) && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let emoji = fields[0].trim ().split (' ').map (codePoint => String.fromCodePoint (parseInt (codePoint, 16))).join ('');
            let type = fields[1].trim ();
            if (!(type in zwjSequencesPatterns))
            {
                zwjSequencesPatterns[type] = [ ];
            }
            zwjSequencesPatterns[type].push (emoji);
        }
    }
    //
    for (let pattern in zwjSequencesPatterns)
    {
        let emojiCodes = zwjSequencesPatterns[pattern].sort ().reverse ().map
        (
            emoji => Array.from (emoji).map (char => unicodeEscape (char.codePointAt (0))).join ('')
        );
        result[pattern] = '(?:' + emojiCodes.join ('|') + ')';
    }
    //
    return result;
}
//
let emojiPatterns = parseData ();
//
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
//
// Keyboard emoji only (fully-qualified)
emojiPatterns["Emoji_Keyboard"] = `(?:${Emoji_ZWJ_Sequence}|${Emoji_Keycap_Sequence}|${Emoji_Flag_Sequence}|${Emoji_Tag_Sequence}|${Emoji_Modifier_Base}${Emoji_Modifier}|${Emoji_Presentation}|${Emoji}\\uFE0F)`;
// All emoji (U+FE0F optional)
emojiPatterns["Emoji_All"] = emojiPatterns["Emoji_Keyboard"].replace (/(\\u{FE0F}|\\uFE0F)/gi, '$1?');
//
module.exports = emojiPatterns;
//
