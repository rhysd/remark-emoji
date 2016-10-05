remark-emoji
============
[![Build Status](https://travis-ci.org/rhysd/remark-emoji.svg?branch=master)](https://travis-ci.org/rhysd/remark-emoji)

This is a [remark](https://github.com/wooorm/remark) plugin to replace `:emoji:` to real UTF-8 emojis in text.

## Usage

```
remark().use(emoji [, options]);
```

```javascript
const remark = require('remark');
const emoji = require('remark-emoji');

const doc = 'Emojis in this text will be replaced: :dog: :+1:';
console.log(remark().use(emoji).process(doc).contents);
// => Emojis in this text will be replaced: 🐶 👍
```

## Options

### `options.padSpaceAfter`

Setting to `true` means that an extra whitespace is added after emoji.
This is useful when browser handle emojis with half character length and following character is hidden.
Default value is `false`.

## License

Distributed under [the MIT License](LICENSE).
