import { Music, Note, Track } from '../utils/audio-utils';

const melody = new Track([
    Note.new("c", 5, 4), null, Note.new("c#", 5, 4), Note.new("d#", 5, 4),
    null, Note.new("f#", 5, 4), Note.new("e", 5, 4), null,
    Note.new("g#", 5, 4), Note.new("a#", 5, 4), null, Note.new("b", 5, 4),
    Note.new("a#", 5, 4), Note.new("g#", 5, 4), Note.new("f#", 5, 4), null,

    Note.new("c", 6, 4), null, Note.new("c#", 6, 4), Note.new("d#", 6, 4),
    null, Note.new("f#", 6, 4), Note.new("e", 6, 4), null,
    Note.new("g#", 6, 4), Note.new("a#", 6, 4), null, Note.new("b", 6, 4),
    Note.new("a#", 6, 4), Note.new("g#", 6, 4), Note.new("f#", 6, 4), null,

    Note.new("f#", 5, 4), null, Note.new("c", 5, 4), null,
    Note.new("f#", 5, 4), null, Note.new("c#", 5, 4), Note.new("d#", 5, 4),
    null, Note.new("e", 5, 4), null, Note.new("g#", 5, 4),
    Note.new("a#", 5, 4), null, Note.new("b", 5, 4), null,

    Note.new("a#", 5, 4), Note.new("g#", 5, 4), null, Note.new("f#", 5, 4),
    Note.new("e", 5, 4), null, Note.new("d#", 5, 4), Note.new("c#", 5, 4),
    null, Note.new("c", 5, 4), null, Note.new("b", 4, 4),
    Note.new("c", 5, 4), null, Note.new("f#", 5, 4), null
], "triangle", 2, 0.012, 0);

const accomp = new Track([
    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null,

    Note.new("f#", 3, 5), null, Note.new("c", 3, 5), null,
    Note.new("g#", 2, 5), null, Note.new("c#", 3, 5), null
], "triangle", 2, 0.02, 0);

const beat = new Track([
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),

    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),

    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),

    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4),
    Note.new("c", 2, 4), Note.new("b", 3, 4), Note.new("f#", 2, 4), Note.new("a#", 3, 4)
], "square", 2, 0.004, 0);

export const music = new Music(
    [melody, accomp, beat]
    // 256 (old bpm param)
);