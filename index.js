const visit = require('unist-util-visit');
const emoji = require('node-emoji');
const emoticon = require('emoticon');

const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;
const RE_SHORT = /[$@|*',;.=:\-)([\]\\/<>038BOopPsdDxXzZ]{2,5}/g;

function plugin(settings) {
    const pad = !!(settings || {}).padSpaceAfter;

    function getEmojiByShortCode(match) {
        // find emoji by shortcode - full match or with-out last char as it could be from text e.g. :-), 
        const iconFull = emoticon.find(e => e.emoticons.includes(match)); // full match
        const iconPart = emoticon.find(e => e.emoticons.includes(match.slice(0, -1))); // second search pattern
        const trimmedChar = iconPart ? match.slice(-1): '';
        const addPad = pad ? ' ': '';
        let icon = iconFull ?
            iconFull.emoji + addPad: 
            iconPart && (iconPart.emoji + addPad +  trimmedChar);
        return icon || match;
    }

    function getEmoji(match) {
        const got = emoji.get(match);
        if (pad && got !== match) {
            return got + ' ';
        }
        return got;
    }

    function transformer(tree) {
        visit(tree, 'text', function(node) {
            node.value = node.value.replace(RE_EMOJI, getEmoji);
            
            if (!RE_EMOJI.test(node.value)) {
                // emoji regex not matching --> check if shortcode
                node.value = node.value.replace(RE_SHORT, getEmojiByShortCode);
            }
        });
    }

    return transformer;
}

module.exports = plugin;
