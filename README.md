remark-emoji
============
[![CI][ci-badge]][ci]
[![npm][npm-badge]][npm]

This is a [remark](https://github.com/remarkjs/remark) plugin to replace `:emoji:` to real UTF-8 emojis in text.

## Demo

You can find a demo in the following [Codesandbox](https://codesandbox.io/s/remark-emoji-example-osvyi).

## Usage

```
remark().use(emoji [, options]);
```

```javascript
import {remark} from 'remark';
import emoji from 'remark-emoji';

const doc = 'Emojis in this text will be replaced: :dog: :+1:';
remark().use(emoji).process(doc).then(file => {
    console.log(String(file));
    // => Emojis in this text will be replaced: 🐶 👍
});
```

Note that this package is [ESM only][esm-only] from v3.0.0 since remark packages migrated to ESM.

## Options

### `options.accessible`

Setting to `true` makes the converted emoji text accessible with `role` and `aria-label` properties. Each emoji
text is wrapped with `<span>` element.

For example,

```javascript
import {remark} from 'remark';
import toHtml from 'remark-html';
import emoji from 'remark-emoji';

const compiler = remark().use(emoji, { accessible: true }).use(toHtml);
compiler.process('Hello :dog:!').then(file => {
    console.log(String(file));
});
```

yields

```html
Hello <span aria-label="dog emoji">🐶</span>!
```

Default value is `false`.

### `options.padSpaceAfter`

Setting to `true` means that an extra whitespace is added after emoji.
This is useful when browser handle emojis with half character length and following character is hidden.
Default value is `false`.

### `options.emoticon`

Setting to `true` means that [emoticon](https://www.npmjs.com/package/emoticon) shortcodes are supported (e.g. :-)
will be replaced by 😃). Default value is `false`.

## License

Distributed under [the MIT License](LICENSE).



[ci-badge]: https://github.com/rhysd/remark-emoji/workflows/CI/badge.svg?branch=master&event=push
[ci]: https://github.com/rhysd/remark-emoji/actions?query=workflow%3ACI
[npm-badge]: https://badge.fury.io/js/remark-emoji.svg
[npm]: https://www.npmjs.com/package/remark-emoji
[esm-only]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
