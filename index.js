import { visit } from 'unist-util-visit';
import emoji from 'node-emoji';
import { emoticon } from 'emoticon';

const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;
const RE_SHORT = /[$@|*'",;.=:\-)([\]\\/<>038BOopPsSdDxXzZ]{2,5}/g;
const RE_UNDERSTORE = /_/g;

const DEFAULT_SETTINGS = {
    padSpaceAfter: false,
    emoticon: false,
};

export default function plugin(options) {
    const settings = Object.assign({}, DEFAULT_SETTINGS, options);
    const pad = !!settings.padSpaceAfter;
    const emoticonEnable = !!settings.emoticon;

    function getEmojiByShortCode(match) {
        // find emoji by shortcode - full match or with-out last char as it could be from text e.g. :-),
        const iconFull = emoticon.find(e => e.emoticons.includes(match)); // full match
        const iconPart = emoticon.find(e => e.emoticons.includes(match.slice(0, -1))); // second search pattern
        const trimmedChar = iconPart ? match.slice(-1) : '';
        const addPad = pad ? ' ' : '';
        let icon = iconFull ? iconFull.emoji + addPad : iconPart && iconPart.emoji + addPad + trimmedChar;
        return icon || match;
    }

    function getEmoji(match) {
        let got = emoji.get(match);

        // Workaround for #19
        if (match.endsWith('_man:') && got === match) {
            // :foo_bar_man: -> man-foo-bar
            const old = 'man-' + match.slice(1, -5).replace(RE_UNDERSTORE, '-');
            const s = emoji.get(old);
            if (s !== old) {
                got = s;
            }
        } else if (match.endsWith('_woman:') && got === match) {
            // :foo_bar_woman: -> woman-foo-bar
            const old = 'woman-' + match.slice(1, -7).replace(RE_UNDERSTORE, '-');
            const s = emoji.get(old);
            if (s !== old) {
                got = s;
            }
        }

        if (pad && got !== match) {
            return got + ' ';
        }
        return got;
    }

    function transformer(tree) {
        visit(tree, 'text', function (node) {
            node.value = node.value.replace(RE_EMOJI, getEmoji);
            if (emoticonEnable) {
                node.value = node.value.replace(RE_SHORT, getEmojiByShortCode);
            }
        });
    }

    return transformer;
}
