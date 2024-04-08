import { unified } from 'unified';
import emoji, { type RemarkEmojiOptions } from './index';
import { expectError, expectAssignable } from 'tsd';

unified().use(emoji);
unified().use(emoji, {});
expectError(unified().use(emoji, { thisOptionDoesNotExist: true }));

unified().use(emoji, { padSpaceAfter: true });
unified().use(emoji, { padSpaceAfter: false });
expectError(unified().use(emoji, { padSpaceAfter: 1 }));

unified().use(emoji, { emoticon: true });
unified().use(emoji, { emoticon: false });
expectError(unified().use(emoji, { emoticon: 1 }));

unified().use(emoji, { accessible: true });
unified().use(emoji, { accessible: false });
expectError(unified().use(emoji, { accessible: 'true' }));

expectAssignable<RemarkEmojiOptions>({});
