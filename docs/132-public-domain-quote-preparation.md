# Quoted wording prepares passages, with free public-domain Bibles

2026-11-21. NR-013 (user request): quotes should use the same Prepare-for-volunteer workflow as spoken references, with a free public-domain Bible and no file to supply.

## What changed

- **Free public-domain Bibles built in.** The King James Version (1769 text) and the World English Bible are bundled as quote-recognition indexes (about 61,000 verses). They are only used to recognise which verse is being quoted; VerseCue never displays them. Sources, licenses and hashes: [legal/PUBLIC-DOMAIN-BIBLES.md](../legal/PUBLIC-DOMAIN-BIBLES.md).
- **One click.** Settings > Quotes > **Use the free public-domain Bibles (KJV and World English Bible)** loads them and turns quote matching on. Importing your own permitted index still works.
- **On by default in Prepare for volunteer.** Starting to listen in that mode loads the free Bibles and turns quote matching on.
- **Prepared, not sent.** A recognised quote becomes a normal candidate for the referenced verse, prepared in ProPresenter's Bible exactly like a spoken reference. It uses the configured default translation (KJV unless changed), whatever wording the preacher used. Nothing goes live; the volunteer decides.
- **Labelled.** The candidate note reads **"Matched from quoted wording, not a spoken reference."** Quotes never Auto-send.
- **Conservative matching across two wordings.** A quote counts only if every matching Bible agrees on a single verse; the existing near-verbatim rules (at least 8 aligned words, 3 distinctive words, a clear winner, refusal of negations such as "do not show") still apply. The candidate limit for this large index was raised to 8,000 verses without discarding competitors, so modern wording such as "work together for good to those who love God" matches. The index builds in small slices in about 5 seconds without freezing the app.

## Verification

| Check | Result |
| --- | --- |
| `tests/public-domain-quotes.test.cjs`: John 3:16 (KJV and modern wording), Psalm 23:1, Romans 8:28, Philippians 4:13, Proverbs 3:5 match; ordinary speech and a negated quote do not; configured translation used; disagreeing wordings and half-built indexes never match | Pass |
| `npm.cmd test`, `npm.cmd run check` (SBOM lists both data files) | 592/592; check passes |
| `scripts/test-quote-prepare.cjs`: quotes on by default in Prepare for volunteer; a quote becomes John 3:16 with the label; zero output requests | Pass |
| User's personal ProPresenter (outputs reported off throughout; synthetic recognized text): "Trust in the Lord with all your heart and lean not on your own understanding" | Prepared Proverbs 3:5 in the installed KJV in about 3.7 s; live slide unchanged. Details kept local |

Not established: quote accuracy on real sermons, paraphrases (still not supported), and false matches over a full service.