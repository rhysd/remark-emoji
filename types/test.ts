import unified = require("unified");
import emoji = require("remark-emoji");

unified().use(emoji);
unified().use(emoji, {});
unified().use(emoji, { padSpaceAfter: true });
unified().use(emoji, { padSpaceAfter: false });

unified().use(emoji, { padSpaceAfter: 1 }); // $ExpectError

unified().use(emoji, { emoticon: true });
unified().use(emoji, { emoticon: false });

unified().use(emoji, { emoticon: 1 }); // $ExpectError
