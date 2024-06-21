import { get as getEmoji } from 'node-emoji';
import { emoticon } from 'emoticon';
import { findAndReplace, type Find, type Replace } from 'mdast-util-find-and-replace';
import type { Plugin } from 'unified';
import type { Root, Nodes, Html } from 'mdast';

const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;
const RE_SHORT = /[$@|*'",;.=:\-)([\]\\/<>038BOopPsSdDxXzZ]{2,5}/g;
const RE_PUNCT = /(?:_|-(?!1))/g;

/**
 * Configuration of remark-emoji plugin.
 */
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
     * An array of CustomEmoji
     *
     * @defaultValue []
     */
    customEmojis?: CustomEmoji[];
}

export interface CustomEmoji {
    /**
     * The list of strings to match for this particular custom emoji
     */
    names: string[];
    /**
     * The url to the image to be used
     */
    url: string;
    /**
     * a friendly title for the emoji
     */
    title: string;
}

const DEFAULT_SETTINGS: RemarkEmojiOptions = {
    padSpaceAfter: false,
    emoticon: false,
    accessible: false,
    customEmojis: [],
};

const plugin: Plugin<[(RemarkEmojiOptions | null | undefined)?], Root> = options => {
    const settings = Object.assign({}, DEFAULT_SETTINGS, options);
    const pad = !!settings.padSpaceAfter;
    const emoticonEnable = !!settings.emoticon;
    const accessible = !!settings.accessible;

    function parseCustomEmoji(customEmojis: CustomEmoji[]): Map<string, Html> {
        const map = new Map<string, Html>();
        for (const customEmoji of customEmojis) {
            const mdast: Html = {
                type: 'html',
                value: `<img src='${customEmoji.url.replace(
                    /'/gu,
                    '%27',
                )}' style='height: 1em' title='${customEmoji.title.replace(/'/gu, '&apos;')}'/>${pad ? '&nbsp;' : ''}`,
            };
            for (const name of customEmoji.names) {
                map.set(`:${name}:`, mdast);
            }
        }

        return map;
    }
    const customEmojis = parseCustomEmoji(settings.customEmojis ?? []);

    function aria(text: string | Html, label: string): Html {
        const value: string = typeof text === 'object' ? text.value : text;

        return {
            type: 'html',
            value: `<span role="img" aria-label="${label}">${value}</span>`,
        };
    }

    function replaceEmoticon(match: string): string | false | Html {
        // find emoji by shortcode - full match or with-out last char as it could be from text e.g. :-),
        const iconFull = emoticon.find(e => e.emoticons.includes(match)); // full match
        const iconPart = emoticon.find(e => e.emoticons.includes(match.slice(0, -1))); // second search pattern
        const icon = iconFull || iconPart;
        if (!icon) {
            return false;
        }
        const trimmedChar = !iconFull && iconPart ? match.slice(-1) : '';
        const addPad = pad ? ' ' : '';
        const replaced = icon.emoji + addPad + trimmedChar;
        if (accessible) {
            return aria(replaced, icon.name + ' emoticon');
        }
        return replaced;
    }

    function replaceEmoji(match: string): string | false | Html {
        let got: Html | string | undefined = customEmojis.get(match);

        if (!got) {
            got = getEmoji(match);

            if (!got) {
                return false;
            }

            if (pad) {
                got = got + ' ';
            }
        }

        if (accessible) {
            const label = match.slice(1, -1).replace(RE_PUNCT, ' ') + ' emoji';
            return aria(got, label);
        }

        return got;
    }

    const replacers: [Find, Replace][] = [[RE_EMOJI, replaceEmoji]];
    if (emoticonEnable) {
        replacers.push([RE_SHORT, replaceEmoticon]);
    }

    function transformer(tree: Nodes): void {
        findAndReplace(tree, replacers);
    }

    return transformer;
};

export default plugin;
