// TypeScript Version: 4.3

import { Plugin } from 'unified';

interface RemarkEmojiOptions {
    /**
     * Adds an extra whitespace after emoji.
     * Useful when browser handle emojis with half character length and
     * the following character is hidden.
     *
     * @defaultValue false
     */
    padSpaceAfter?: boolean;
    /**
     * Whether to support emoticon shortcodes (e.g. :-) will be replaced by 😃)
     *
     * @defaultValue false
     */
    emoticon?: boolean;
}

declare const plugin: Plugin<[RemarkEmojiOptions?]>;
export default plugin;
