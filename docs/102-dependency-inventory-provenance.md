# Dependency inventory provenance

The original NFR-018 audit found that the tracked inventory identified application0.5.7 although current source was0.6.0. The verifier reproduces that mismatch before regeneration.

The regenerated schema2 inventory retains the pinned components, license identifiers, integrity and development flags and adds each lockfile package path plus a SHA256 of the lockfile with CRLF normalized to LF. Normalization makes identical checkouts portable between Windows and Mac; changes to lockfile content or application version require deliberate regeneration and review.

Run node scripts/dependency-inventory.cjs to generate or append --check to verify without writing. The normal syntax/check command and package builder verify the inventory before proceeding. The isolated review-build stage now includes the lockfile needed by that check. Importing the generator performs no write.

Three synthetic fixture tests reject stale application/dependency/path data, changed lockfile content and package/lockfile version disagreement; equivalent line endings remain valid. Existing476 module tests plus these three pass. Native packaging verification remains before merge. This is an inventory and provenance guard, not an independent license, vulnerability or complete transitive runtime audit. Electron and optional speech notices remain separately required.
