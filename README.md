remark-emoji
============
[![Build Status](https://travis-ci.org/rhysd/remark-emoji.svg?branch=master)](https://travis-ci.org/rhysd/remark-emoji)

This is a [remark](https://github.com/wooorm/remark) plugin to replace `:emoji:` to real UTF-8 emojis in text.

## Usage

```javascript
const remark = require('remark');
const emoji = require('remark-emoji');

const doc = 'Emojis in this text will be relpaces: :dog: :+1:';
console.log(remark().use(emoji).process(doc).contents);
// => Emojis in this text will be relpaces: 🐶 👍
```

## License

Distributed under [the MIT License](LICENSE).
