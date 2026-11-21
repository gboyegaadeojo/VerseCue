# Public-domain Bible texts used for quote recognition

Recorded 2026-11-21. Used only to recognise quoted wording (NR-013). VerseCue never displays these texts; matched passages are prepared in the user's installed ProPresenter translation.

| Index | Source | Source archive SHA-256 | Status | Index file SHA-256 |
| --- | --- | --- | --- | --- |
| core/data/quote-index-kjv.json (30,704 verses) | https://ebible.org/Scriptures/eng-kjv2006_vpl.zip (King James Version, 1769 standard text, protocanon) | 079e779dde42448b5da4b05bf771b2943499ce8ccf60193eef215d739b1567e0 | Public domain outside the United Kingdom. eBible.org notes that Crown letters patent restrict printing in or importing printed copies into the UK. | a69f15900090793eb7510ffd417e31384950fa76dcd1507652c3900f645f2513 |
| core/data/quote-index-web.json (30,583 verses) | https://ebible.org/Scriptures/engwebp_vpl.zip (World English Bible) | f1e570fecb8ab80cf6d9e764172eb06e078b179aae3159a131ab98424267c3e6 | Public domain | b46eafb441323788b41578ab4a5545816fe6ad6f33fdaeab6755310e8897c50a |

Built with scripts/build-public-domain-quote-index.cjs, which keeps only canonical 66-book verse references that round-trip through VerseCue's parser, removes bracket markup and skips verses under eight words (too short to match safely). Downloaded 2026-11-21.