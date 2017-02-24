const assert = require('assert');
const remark = require('remark');
const github = require('remark-github');
const headings = require('remark-autolink-headings');
const slug = require('remark-slug');
const emoji = require('.');

const compiler = remark().use(github).use(headings).use(slug).use(emoji);
const padded = remark().use(github).use(headings).use(slug).use(emoji, {padSpaceAfter: true});

function process(contents) {
    return compiler.process(contents).then(function (file) {
        return file.contents;
    });
}

function processPad(contents) {
    return padded.process(contents).then(function (file) {
        return file.contents;
    });
}


describe('remark-emoji', () => {
    it('replaces emojis in text', () => {
        const cases = {
            'This is :dog:': 'This is 🐶\n',
            ':dog: is not :cat:': '🐶 is not 🐱\n',
            'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
            ':triumph:': '😤\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('does not replace emoji-like but not-a-emoji stuffs', () => {
        const cases = {
            'This text does not include emoji.': 'This text does not include emoji.\n',
            ':++: or :foo: or :dog': ':++: or :foo: or :dog\n',
            '::': '::\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('replaces in link text', () => {
        const cases = {
            'In inline code, `:dog: is not replaced`': 'In inline code, `:dog: is not replaced`\n',
            'In code, \n```\n:dog: is not replaced\n```': 'In code, \n\n    :dog: is not replaced\n',
            '[here :dog: and :cat: pictures!](https://example.com)': '[here 🐶 and 🐱 pictures!](https://example.com)\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('can handle an emoji including 2 underscores', () => {
        return process(':heavy_check_mark:').then(r => assert.equal(r, '✔️\n'));
    });

    it('adds an white space after emoji when padSpaceAfter is set to true', () => {
        const cases = {
            ':dog: is dog': '🐶  is dog\n',
            'dog is :dog:': 'dog is 🐶 \n',
            ':dog: is not :cat:': '🐶  is not 🐱 \n',
            ':triumph:': '😤 \n'
        };

        return Promise.all(
            Object.keys(cases).map(c => processPad(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('can handle emoji that use dashes to separate words instead of underscores', () => {
        const cases = {
            'The Antarctic flag is represented by :flag-aq:': 'The Antarctic flag is represented by 🇦🇶\n',
            ':man-woman-girl-boy:': '👨‍👩‍👧‍👦\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });
});
