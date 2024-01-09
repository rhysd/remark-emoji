import type { Plugin } from 'unified';
import type { Root } from 'mdast';

export interface RemarkEmojiOptions {
    /**
     * Makes converted emoji and emoticon texts accessible by wrapping them with
     * `span` element setting `role` and `aria-label` attributes.
     *
     * @defaultValue false
     */
    accessible?: boolean;
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
    /**
     * Custom emojis. For example, to render `:parrot:` as a gif emoji:
     *
     * ```js
     * remark().use(emoji, {
     *   customEmojis: {
     *     parrot: '<img src="https://cultofthepartyparrot.com/parrots/parrot.gif" style="width:auto;height:1em;">'
     *   }
     * });
     * ```
     */
    customEmojis?: Record<string, string>;
}

declare const plugin: Plugin<[(RemarkEmojiOptions | null | undefined)?], Root>;
export default plugin;
