const visit = require('unist-util-visit');
const emoji = require('node-emoji');

const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;

function plugin(settings) {
    const pad = !!(settings || {}).padSpaceAfter;

    function getEmoji(match) {
        const got = emoji.get(match);
        if (!pad || got === match) {
            return got;
        }

        return got + ' ';
    }

    function transformer(tree) {
        visit(tree, 'text', function (node) {
            node.value = node.value.replace(RE_EMOJI, getEmoji);
        });
    }

    return transformer;
}

module.exports = plugin;
