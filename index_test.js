import assert from 'assert';
import { remark } from 'remark';
import github from 'remark-github';
import headings from 'remark-autolink-headings';
import slug from 'remark-slug';
import remarkHtml from 'remark-html';
import emoji from './index.js';

const compiler = remark().use(github).use(headings).use(slug).use(emoji);
const padded = remark().use(github).use(headings).use(slug).use(emoji, { padSpaceAfter: true });
const emoticon = remark().use(github).use(headings).use(slug).use(emoji, { emoticon: true });
const padAndEmoticon = remark().use(github).use(headings).use(slug).use(emoji, { padSpaceAfter: true, emoticon: true });
const ariaHtml = remark().use(emoji, { emoticon: true, accessible: true }).use(remarkHtml, { sanitize: false });

function process(contents) {
    return compiler.process(contents).then(function (file) {
        return String(file);
    });
}

function processPad(contents) {
    return padded.process(contents).then(function (file) {
        return String(file);
    });
}

function processEmoticon(contents) {
    return emoticon.process(contents).then(function (file) {
        return String(file);
    });
}

function processPadAndEmoticon(contents) {
    return padAndEmoticon.process(contents).then(function (file) {
        return String(file);
    });
}

function processAriaHtml(contents) {
    return ariaHtml.process(contents).then(function (file) {
        return String(file);
    });
}

describe('remark-emoji', () => {
    describe('default compiler', () => {
        it('replaces emojis in text', () => {
            const cases = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
            };

            return Promise.all(Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c]))));
        });

        it('does not replace emoji-like but not-a-emoji stuffs', () => {
            const cases = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            return Promise.all(Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c]))));
        });

        it('replaces in link text', () => {
            const cases = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```': 'In code,\n\n    :dog: and :-) is not replaced\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and :-) pictures!](https://example.com)\n',
            };

            return Promise.all(Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c]))));
        });

        it('can handle an emoji including 2 underscores', () => {
            return process(':heavy_check_mark:').then(r => assert.equal(r, '✔️\n'));
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', () => {
            const cases = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': ':-)\n',
                'Smile :-), not >:(!': 'Smile :-), not >:(!\n',
            };

            return Promise.all(Object.keys(cases).map(c => processPad(c).then(r => assert.equal(r, cases[c]))));
        });

        it('can handle emoji that use dashes to separate words instead of underscores', () => {
            const cases = {
                'The Antarctic flag is represented by :flag-aq:': 'The Antarctic flag is represented by 🇦🇶\n',
                ':man-woman-girl-boy:': '👨‍👩‍👧‍👦\n',
            };

            return Promise.all(Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c]))));
        });

        it('handles man-*/woman-* with *_man/*_woman (#19)', () => {
            const cases = {
                'Hello, :walking_man:': 'Hello, \uD83D\uDEB6\u200D\u2642\uFE0F\n',
                'Hello, :walking_woman:': 'Hello, \uD83D\uDEB6\u200D\u2640\uFE0F\n',
                'Hello, :mountain_biking_woman:': 'Hello, \uD83D\uDEB5\u200D\u2640\uFE0F\n',
            };

            return Promise.all(Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c]))));
        });
    });

    describe('emoticon support', () => {
        it('replaces emojis in text', () => {
            const cases = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
            };

            return Promise.all(Object.keys(cases).map(c => processEmoticon(c).then(r => assert.equal(r, cases[c]))));
        });

        it('does not replace emoji-like but not-a-emoji stuffs', () => {
            const cases = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            return Promise.all(Object.keys(cases).map(c => processEmoticon(c).then(r => assert.equal(r, cases[c]))));
        });

        it('replaces in link text', () => {
            const cases = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```': 'In code,\n\n    :dog: and :-) is not replaced\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and 😃 pictures!](https://example.com)\n',
            };

            return Promise.all(Object.keys(cases).map(c => processEmoticon(c).then(r => assert.equal(r, cases[c]))));
        });

        it('can handle an emoji including 2 underscores', () => {
            return processEmoticon(':heavy_check_mark:').then(r => assert.equal(r, '✔️\n'));
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', () => {
            const cases = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': '😃&#x20;\n',
                'Smile :-), not >:(!': 'Smile 😃 , not 😠 !\n',
            };

            return Promise.all(
                Object.keys(cases).map(c => processPadAndEmoticon(c).then(r => assert.equal(r, cases[c])))
            );
        });

        it('can handle emoji that use dashes to separate words instead of underscores', () => {
            const cases = {
                'The Antarctic flag is represented by :flag-aq:': 'The Antarctic flag is represented by 🇦🇶\n',
                ':man-woman-girl-boy:': '👨‍👩‍👧‍👦\n',
            };

            return Promise.all(Object.keys(cases).map(c => processEmoticon(c).then(r => assert.equal(r, cases[c]))));
        });

        it('can handle emoji shortcodes (emoticon)', () => {
            const cases = {
                ':p': '😛\n',
                ':-)': '😃\n',
                'With-in some text :-p, also with some  :o spaces :-)!':
                    'With-in some text 😛, also with some  😮 spaces 😃!\n',
                'Four char code ]:-)': 'Four char code 😈\n',
                'No problem with :dog: - :d': 'No problem with 🐶 - 😛\n',
                'With double quotes :"D': 'With double quotes 😊\n',
            };

            return Promise.all(Object.keys(cases).map(c => processEmoticon(c).then(r => assert.equal(r, cases[c]))));
        });

        it('should not break ::: (#23)', () => {
            const input = '::: danger Title\n\nbla bla bla\n\n:::\n';
            return processEmoticon(input).then(output => assert.equal(output, input));
        });
    });

    describe('accessibility support', () => {
        it('wraps emoji with span', () => {
            const tests = {
                ':dog:': '<p><span role="img" aria-label="dog emoji">🐶</span></p>\n',
                ':dog: :cat:':
                    '<p><span role="img" aria-label="dog emoji">🐶</span> <span role="img" aria-label="cat emoji">🐱</span></p>\n',
                ':-)': '<p><span role="img" aria-label="smiley emoticon">😃</span></p>\n',
                'Hello, :walking_man:':
                    '<p>Hello, <span role="img" aria-label="walking man emoji">\uD83D\uDEB6\u200D\u2642\uFE0F</span></p>\n',
                'Hello, :man-walking:':
                    '<p>Hello, <span role="img" aria-label="man walking emoji">\uD83D\uDEB6\u200D\u2642\uFE0F</span></p>\n',
                ':+1:': '<p><span role="img" aria-label="+1 emoji">👍</span></p>\n',
                ':-1:': '<p><span role="img" aria-label="-1 emoji">👎</span></p>\n',
            };

            return Promise.all(Object.keys(tests).map(t => processAriaHtml(t).then(h => assert.equal(h, tests[t]))));
        });
    });
});
