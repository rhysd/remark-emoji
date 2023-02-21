import { unified } from 'unified';
import emoji, { type RemarkEmojiOptions } from 'remark-emoji';

unified().use(emoji);
unified().use(emoji, {});
unified().use(emoji, { padSpaceAfter: true });
unified().use(emoji, { padSpaceAfter: false });

unified().use(emoji, { padSpaceAfter: 1 }); // $ExpectError

unified().use(emoji, { emoticon: true });
unified().use(emoji, { emoticon: false });

unified().use(emoji, { emoticon: 1 }); // $ExpectError

unified().use(emoji, { accessible: true });
unified().use(emoji, { accessible: false });

const opts: RemarkEmojiOptions = {};
unified().use(emoji, opts);

const invalidOpts: RemarkEmojiOptions = { accessible: 'true' }; // $ExpectError
