import assert from 'assert';
import { remark } from 'remark';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import gfm from 'remark-gfm';
import github from 'remark-github';
import remarkRehype from 'remark-rehype';
import headings from 'rehype-autolink-headings';
import slug from 'rehype-slug';
import emoji from './index.js';
import rehypeStringify from 'rehype-stringify';
import { defaultSchema } from 'rehype-sanitize';

const schema = structuredClone(defaultSchema);
assert.ok(schema.attributes);
if ('span' in schema.attributes) {
    schema.attributes['span'].push('role', 'ariaLabel');
} else {
    schema.attributes['span'] = ['role', 'ariaLabel'];
}

const compiler = remark().use(emoji);
const padded = remark().use(emoji, { padSpaceAfter: true });
const emoticon = remark().use(emoji, { emoticon: true });
const padAndEmoticon = remark().use(emoji, { padSpaceAfter: true, emoticon: true });
const ariaHtml = remark().use(emoji, { emoticon: true, accessible: true });
const githubFlavor = remark().use(gfm).use(github).use(emoji);
const toRehype = unified().use(remarkParse).use(emoji).use(remarkRehype).use(slug).use(headings).use(rehypeStringify);

const customEmojis = [
    {
        names: ['parrot', 'partyparrot', 'party-parrot', 'party_parrot'],
        url: 'https://cultofthepartyparrot.com/parrots/parrot.gif',
        title: 'party parrot',
    },
];
const customHtml = remark().use(emoji, { emoticon: true, customEmojis });
const customAriaHtml = remark().use(emoji, { accessible: true, customEmojis });
const customWithPadHtml = remark().use(emoji, { padSpaceAfter: true, emoticon: true, customEmojis });

describe('remark-emoji', function () {
    describe('minimal compiler', function () {
        it('replaces emojis in text', async function () {
            const tests: Record<string, string> = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
                ':stuck_out_tongue_winking_eye:': '😜\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('does not replace emoji-like but not-a-emoji stuffs', async function () {
            const tests: Record<string, string> = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('replaces in link text', async function () {
            const tests: Record<string, string> = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```':
                    'In code,\n\n```\n:dog: and :-) is not replaced\n```\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and :-) pictures!](https://example.com)\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await compiler.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles an emoji including 2 underscores', async function () {
            const result = await compiler.process(':heavy_check_mark:');
            assert.equal(String(result), '✔️\n');
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', async function () {
            const tests: Record<string, string> = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': ':-)\n',
                'Smile :-), not >:(!': 'Smile :-), not >:(!\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await padded.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles emoji that use dashes to separate words instead of underscores', async function () {
            const result = await compiler.process('T-Rex emoji is :t-rex:');
            assert.equal(String(result), 'T-Rex emoji is 🦖\n');
        });
    });

    describe('transforms markdown AST to rehype with other remark and rehype plugins', function () {
        it('replaces emois in transformed HTML text', async function () {
            // `id="hello-world"` is inserted by rehype-slug
            // `<a aria-hidden="true" tabindex="-1" href="#hello-world">...` is inserted by rehype-autolink-headings
            const input = '# Hello world\nWoo :dog: is not :cat:.';
            const expected =
                '<h1 id="hello-world"><a aria-hidden="true" tabindex="-1" href="#hello-world"><span class="icon icon-link"></span></a>Hello world</h1>\n<p>Woo 🐶 is not 🐱.</p>';

            const result = await toRehype.process(input);
            assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
        });
    });

    describe('transforms markdown AST with other remark plugins', function () {
        it('replaces emois in text with GitHub-Flavored Markdown extensions', async function () {
            // `- [x]` task list is handled by remark-gfm
            // `@rhysd` auto link is handled by remark-github
            const input = '- [x] @rhysd is a :dog:.';
            const expected = '* [x] [**@rhysd**](https://github.com/rhysd) is a 🐶.\n';

            const result = await githubFlavor.process(input);
            assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
        });
    });

    describe('emoticon support', function () {
        it('replaces emojis in text', async function () {
            const tests: Record<string, string> = {
                'This is :dog:': 'This is 🐶\n',
                ':dog: is not :cat:': '🐶 is not 🐱\n',
                'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
                ':triumph:': '😤\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('does not replace emoji-like but not-a-emoji stuffs', async function () {
            const tests: Record<string, string> = {
                'This text does not include emoji.': 'This text does not include emoji.\n',
                ':++: or :foo: or :cat': ':++: or :foo: or :cat\n',
                '::': '::\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('replaces in link text', async function () {
            const tests: Record<string, string> = {
                'In inline code, `:dog: and :-) is not replaced`': 'In inline code, `:dog: and :-) is not replaced`\n',
                'In code, \n```\n:dog: and :-) is not replaced\n```':
                    'In code,\n\n```\n:dog: and :-) is not replaced\n```\n',
                '[here :dog: and :cat: and :-) pictures!](https://example.com)':
                    '[here 🐶 and 🐱 and 😃 pictures!](https://example.com)\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles an emoji including 2 underscores', async function () {
            const result = await emoticon.process(':heavy_check_mark:');
            assert.equal(String(result), '✔️\n');
        });

        it('adds an white space after emoji when padSpaceAfter is set to true', async function () {
            const tests: Record<string, string> = {
                ':dog: is dog': '🐶  is dog\n',
                'dog is :dog:': 'dog is 🐶&#x20;\n',
                ':dog: is not :cat:': '🐶  is not 🐱&#x20;\n',
                ':triumph:': '😤&#x20;\n',
                ':-)': '😃&#x20;\n',
                'Smile :-), not >:(!': 'Smile 😃 , not 😠 !\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await padAndEmoticon.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });

        it('handles emoji that use dashes to separate words instead of underscores', async function () {
            const result = await emoticon.process('T-Rex emoji is :t-rex:');
            assert.equal(String(result), 'T-Rex emoji is 🦖\n');
        });

        it('handles emoji shortcodes (emoticon)', async function () {
            const tests: Record<string, string> = {
                ':p': '😛\n',
                ':-)': '😃\n',
                'With-in some text :-p, also with some  :o spaces :-)!':
                    'With-in some text 😛, also with some  😮 spaces 😃!\n',
                'Four char code ]:-)': 'Four char code 😈\n',
                'No problem with :dog: - :d': 'No problem with 🐶 - 😛\n',
                'With double quotes :"D': 'With double quotes 😊\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await emoticon.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
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
            const tests: Record<string, string> = {
                ':dog:': '<span role="img" aria-label="dog emoji">🐶</span>\n',
                ':dog: :cat:':
                    '<span role="img" aria-label="dog emoji">🐶</span> <span role="img" aria-label="cat emoji">🐱</span>\n',
                ':-)': '<span role="img" aria-label="smiley emoticon">😃</span>\n',
                ':+1:': '<span role="img" aria-label="+1 emoji">👍</span>\n',
                ':-1:': '<span role="img" aria-label="-1 emoji">👎</span>\n',
                ':stuck_out_tongue_winking_eye:':
                    '<span role="img" aria-label="stuck out tongue winking eye emoji">😜</span>\n',
            };

            for (const [input, expected] of Object.entries(tests)) {
                const result = await ariaHtml.process(input);
                assert.equal(String(result), expected, `input: ${JSON.stringify(input)}`);
            }
        });
    });

    describe('custom emoji support', function () {
        it('should turn a custom emoji to an image', async function() {
            const result = await customHtml.process("We've got a :party-parrot: in the house!");
            assert.equal(String(result), `We've got a <img src='${customEmojis[0].url}' style='height: 1em' title='${customEmojis[0].title}'/> in the house!\n`);
        });
        it('wraps custom emoji with span', async function () {
            const result = await customAriaHtml.process("We've got a :party-parrot: in the house!");
            assert.equal(String(result), `We've got a <span role="img" aria-label="${customEmojis[0].title} emoji"><img src='${customEmojis[0].url}' style='height: 1em' title='${customEmojis[0].title}'/></span> in the house!\n`);
        });
        it('should include a trailing space', async function() {
            const result = await customWithPadHtml.process("We've got a :party-parrot: in the house!");
            assert.equal(String(result), `We've got a <img src='${customEmojis[0].url}' style='height: 1em' title='${customEmojis[0].title}'/>&nbsp; in the house!\n`);
        });
        it('should work with emoticons', async function() {
            const result = await customHtml.process("We've got a :party-parrot: :p in the house!");
            assert.equal(String(result), `We've got a <img src='${customEmojis[0].url}' style='height: 1em' title='${customEmojis[0].title}'/> 😛 in the house!\n`);
        });
    })
});
