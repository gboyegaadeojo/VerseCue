'use strict';
// Book-name hints (NR-022): the 66 book names given to the speech engine as preceding context, so it expects them.
// The engine treats them as earlier speech, not as words said now; every reference still comes from the current phrase,
// and Auto keeps all of its rules. Optional and off by default: on a processor it made each phrase about three times
// slower (docs/145). The in-app accuracy check measures both ways on the operator's own voice and computer.
const BOOKS='Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalm, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation.';
const SPEECH_HINT='Books of the Bible: '+BOOKS;
module.exports={SPEECH_HINT};
