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

describe('remark-emoji', function () {
    describe('default compiler', function () {
        it('replaces emojis in text', async function () {
            const tests = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('does not replace emoji-like but not-a-emoji stuffs', async function () {
            const tests = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('replaces in link text', async function () {
            const tests = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```': 'In code,\n\n    :dog: and :-) is not replaced\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and :-) pictures!](https://example.com)\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles an emoji including 2 underscores', async function () {
            const result = await compiler.process(':heavy_check_mark:');
            assert.equal(String(result), '✔️\n');
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', async function () {
            const tests = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': ':-)\n',
                'Smile :-), not >:(!': 'Smile :-), not >:(!\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await padded.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles emoji that use dashes to separate words instead of underscores', async function () {
            const tests = {
                'The Antarctic flag is represented by :flag-aq:': 'The Antarctic flag is represented by 🇦🇶\n',
                ':man-woman-girl-boy:': '👨‍👩‍👧‍👦\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles man-*/woman-* with *_man/*_woman (#19)', async function () {
            const tests = {
                'Hello, :walking_man:': 'Hello, \uD83D\uDEB6\u200D\u2642\uFE0F\n',
                'Hello, :walking_woman:': 'Hello, \uD83D\uDEB6\u200D\u2640\uFE0F\n',
                'Hello, :mountain_biking_woman:': 'Hello, \uD83D\uDEB5\u200D\u2640\uFE0F\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });
    });

    describe('emoticon support', function () {
        it('replaces emojis in text', async function () {
            const tests = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('does not replace emoji-like but not-a-emoji stuffs', async function () {
            const tests = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('replaces in link text', async function () {
            const tests = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```': 'In code,\n\n    :dog: and :-) is not replaced\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and 😃 pictures!](https://example.com)\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles an emoji including 2 underscores', async function () {
            const result = await emoticon.process(':heavy_check_mark:');
            assert.equal(String(result), '✔️\n');
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', async function () {
            const tests = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': '😃&#x20;\n',
                'Smile :-), not >:(!': 'Smile 😃 , not 😠 !\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await padAndEmoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles emoji that use dashes to separate words instead of underscores', async function () {
            const tests = {
                'The Antarctic flag is represented by :flag-aq:': 'The Antarctic flag is represented by 🇦🇶\n',
                ':man-woman-girl-boy:': '👨‍👩‍👧‍👦\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles emoji shortcodes (emoticon)', async function () {
            const tests = {
                ':p': '😛\n',
                ':-)': '😃\n',
                'With-in some text :-p, also with some  :o spaces :-)!':
                    'With-in some text 😛, also with some  😮 spaces 😃!\n',
                'Four char code ]:-)': 'Four char code 😈\n',
                'No problem with :dog: - :d': 'No problem with 🐶 - 😛\n',
                'With double quotes :"D': 'With double quotes 😊\n',
            };

            for (const input of Object.keys(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });

        it('should not break ::: (#23)', async function () {
            const input = '::: danger Title\n\nbla bla bla\n\n:::\n';
            const result = await emoticon.process(input);
            assert.equal(String(result), input);
        });
    });

    describe('accessibility support', function () {
        it('wraps emoji with span', async function () {
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

            for (const input of Object.keys(tests)) {
                const result = await ariaHtml.process(input);
                assert.equal(String(result), tests[input], `input: ${JSON.stringify(input)}`);
            }
        });
    });
});
