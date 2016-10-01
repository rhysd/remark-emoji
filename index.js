const visit = require('unist-util-visit');
const emoji = require('node-emoji');

const RE_EMOJI = /:\+1:|:-1:|:\w+:/g;

function plugin() {
    function transformer(tree) {
        visit(tree, 'text', node => {
            node.value = node.value.replace(RE_EMOJI, m => emoji.get(m));
        });
    }
    return transformer;
}

module.exports = plugin;
