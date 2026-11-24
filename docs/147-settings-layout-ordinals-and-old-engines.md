# 147 - Settings layout, "1st/Second" references and old speech files (NR-024)

Date: 2026-11-24. User report after installing 0.6.6, with screenshots:

- the Settings spacing;
- the stretched "?" beside the close button;
- content scrolling into the header;
- confusing speech settings;
- "does not understand anything with 1st or Second";
- slowness;
- the model path still pointing at a 0.6.0 download.

## 1. "1st" and "Second" (real bugs, fixed)

The reader already handled every usual spelling ("1st John", "First John", "Second Timothy", "II Timothy"). Two real gaps were found:

- **Punctuation between the number and the book.**
  - When the preacher pauses after "First", the speech engine writes "First, John 1:9", "1st. John 1:9" or "1. John 1:9". The reader took these as the Gospel of John: the wrong book.
  - "2nd. Timothy" and "2 nd Timothy" were not recognised at all.
  - Now the number is joined to the numbered book (Samuel, Kings, Chronicles, Corinthians, Thessalonians, Timothy, Peter, John).
  - The pause makes the wording ambiguous, so such references carry the review issue "Number and book were heard apart · review". Auto never sends them.
- **A pause long enough to split the phrase.**
  - A phrase ending in "First", "Second" or "Third" (or 1st/2nd/3rd) was dropped. The next phrase, "John 1:9", was then taken alone as the Gospel of John.
  - Such a phrase now waits for the next one. If that starts with a numbered book, they are joined: "First" + "John 1:9" becomes 1 John 1:9.
  - Joined phrases were already review-only.
  - A phrase that has its own reference ("Read John 3:16 first") is never held.

Tests: `tests/approximate-books.test.cjs`, `tests/citation-stabilizer.test.cjs`.

## 2. Old speech files from an earlier download

- **The problem:** settings carry over when a new version is installed. On the user's computer the engine was the new built-in one, but the model was still `Downloads\Compressed\VerseCue-0.6.0-win32-x64\...\resources\speech\ggml-base.en.bin`. It's the same model file, but it was confusing and would break if that folder was deleted.
- **At start:** any saved engine or model that is another VerseCue copy's built-in file (a `resources/speech` folder that isn't this copy's) is now replaced by this version's own. Files the operator chose elsewhere, such as the NVIDIA engine, are left alone.
- **The built-in engine button:** "Use VerseCue's built-in speech engine" now resets the model too.

### Every update uses its own engine and model (user decision, 2026-11-24)

- **What happens:** settings now record which VerseCue version set the speech engine (`speechEngineVersion`). On the first start after an update, the engine and model are reset to the ones bundled with that version, and the settings are saved.
- **Exception:** the NVIDIA engine from VerseCue's guided setup is kept while it is the same whisper.cpp release as the built-in engine (currently b5454). Its model is still reset to the bundled one.
- **Your own engine:** an engine or model you choose yourself stays in place until the next update.
- **Test:** `scripts/test-engine-update.cjs`, packaged builds only. It covers an older copy's paths, a custom engine with an earlier marker, and no marker at all; each must end on this version's own engine, model and marker.
- **Not covered:** this does not move VerseCue to a newer upstream whisper.cpp. The bundled build stays pinned and tested (b5454 with base.en); upgrading it is separate work that needs every build retested.

## 3. Speed

On the user's laptop the bundled engine uses the NVIDIA RTX 2060 (Vulkan device 0, picked correctly). For a 12-second clip, recognition took 0.17 s to encode and 0.45 s to decode. The 2.3 s model load happens once in the default keep-loaded mode. So recognition is not the bottleneck there.

The likely cause is ProPresenter preparation in Prepare for volunteer: several seconds, growing as ProPresenter slows during a session (docs/140). Settings > Speech now shows how long the last phrase took to recognise and the last passage took to open in ProPresenter, so the cause is visible.

## 4. Settings layout (`ui/settings.css`, loaded last)

- **Header and footer:** opaque and always visible; only the section content scrolls. Before, the Halo styles made the header transparent, so scrolled text showed through it.
- **"?" and ×:** matching round buttons, centred on the title (34 px; 44 px in the Large text size).
- **Forms:**
  - labels sit above their fields, which are up to 520 px wide;
  - spacing is even;
  - checkboxes are aligned with their text;
  - sections are separated by a line;
  - the level meter is visible.
- **Narrow windows:** the section list becomes a single row that scrolls sideways, with names never split mid-word.
- **Settings > Speech:**
  - a plain status line first: which engine, where it runs and the recent timings, with a button to return to the built-in engine when needed;
  - then the accuracy check and book-name hints;
  - everything else under a collapsed **Advanced speech options**: engine mode, graphics card, custom files and NVIDIA setup.
