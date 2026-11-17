# Requirements traceability matrix

2026-11-17. **All integration-dependent mappings/outcomes are PROVISIONAL; P0 PENDING.** Every numbered requirement is mapped individually. Test status for every row: PENDING, not executed. This matrix links acceptance scenarios in docs/02–03 to named cases and suites in docs/06; no ID-only test is considered executed evidence. Owner/release copied from requirement authority.

## Objective and BR coverage

| Objective | BR | Business acceptance | Primary system evidence |
|---|---|---|---|
| OBJ-01 timely accurate reference | BR-001 | Exact reference precision/recall and latency | TS-AUDIO/STT/PARSER, T-NFR-001/002, E2E-01/02/03/06 |
| OBJ-02 preserve existing production | BR-002 | Genuine text/theme/Looks and manual/media continuity | IT-01–13, TS-CONNECTOR/RESILIENCE, E2E-04/05 |
| OBJ-03 human authority/safe automation | BR-003 | No unsafe output, clear modes and control | TS-POLICY/UX, E2E-03/04/05/07/08/09 |
| OBJ-04 free/local/private | BR-004 | No metered dependency/default content storage | TS-PRIVACY, T-NFR-007/010/011/023, E2E-10 |
| OBJ-05 reliable inclusive deployment | BR-005 | OS install/soak and volunteer accessibility | TS-PACKAGE/UX/RESILIENCE, T-NFR-013/015/016/017 |
| OBJ-06 maintainable lawful operation | BR-006 | Rights/security/update/recovery evidence | TS-PRIVACY/PACKAGE, T-NFR-018/019/020/021 |

## Individual requirement mapping

| Requirement | Objective | BR | Acceptance case | Scenario suite | Owner / release (authoritative requirement row) |
|---|---|---|---|---|---|
| FR-001 | OBJ-01 | BR-001 | T-FR-001 | TS-AUDIO | audio / MVP / BR-001 |
| FR-002 | OBJ-04 | BR-004 | T-FR-002 | TS-AUDIO | audio / MVP / BR-004 |
| FR-003 | OBJ-01 | BR-001 | T-FR-003 | TS-AUDIO | audio / MVP / BR-001 |
| FR-004 | OBJ-01 | BR-001 | T-FR-004 | TS-AUDIO | audio / MVP / BR-001 |
| FR-005 | OBJ-03 | BR-003 | T-FR-005 | TS-AUDIO | audio / MVP / BR-003 |
| FR-006 | OBJ-03 | BR-003 | T-FR-006 | TS-AUDIO | audio / MVP / BR-003 |
| FR-007 | OBJ-03 | BR-003 | T-FR-007 | TS-AUDIO | audio / MVP / BR-003 |
| FR-008 | OBJ-05 | BR-005 | T-FR-008 | TS-AUDIO | audio / v1 / BR-005 |
| FR-009 | OBJ-01 | BR-001 | T-FR-009 | TS-STT/TS-POLICY | speech / MVP / BR-001 |
| FR-010 | OBJ-03 | BR-003 | T-FR-010 | TS-STT/TS-POLICY | speech / MVP / BR-003 |
| FR-011 | OBJ-01 | BR-001 | T-FR-011 | TS-PARSER/TS-POLICY | parser / MVP / BR-001 |
| FR-012 | OBJ-01 | BR-001 | T-FR-012 | TS-PARSER/TS-POLICY | parser / MVP / BR-001 |
| FR-013 | OBJ-03 | BR-003 | T-FR-013 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-014 | OBJ-01 | BR-001 | T-FR-014 | TS-PARSER/TS-POLICY | parser / v1 / BR-001 |
| FR-015 | OBJ-01 | BR-001 | T-FR-015 | TS-PARSER/TS-POLICY | parser / v1 / BR-001 |
| FR-016 | OBJ-03 | BR-003 | T-FR-016 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-017 | OBJ-03 | BR-003 | T-FR-017 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-018 | OBJ-03 | BR-003 | T-FR-018 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-019 | OBJ-03 | BR-003 | T-FR-019 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-020 | OBJ-03 | BR-003 | T-FR-020 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-021 | OBJ-03 | BR-003 | T-FR-021 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-022 | OBJ-03 | BR-003 | T-FR-022 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-023 | OBJ-03 | BR-003 | T-FR-023 | TS-PARSER/TS-POLICY | parser / MVP / BR-003 |
| FR-024 | OBJ-01 | BR-001 | T-FR-024 | TS-PARSER/TS-POLICY | speech / v1 / BR-001 |
| FR-025 | OBJ-03 | BR-003 | T-FR-025 | TS-PARSER/TS-POLICY | product / v2 / BR-003 |
| FR-026 | OBJ-03 | BR-003 | T-FR-026 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-027 | OBJ-01 | BR-001 | T-FR-027 | TS-UX/TS-POLICY | UX / MVP / BR-001 |
| FR-028 | OBJ-03 | BR-003 | T-FR-028 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-029 | OBJ-03 | BR-003 | T-FR-029 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-030 | OBJ-03 | BR-003 | T-FR-030 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-031 | OBJ-03 | BR-003 | T-FR-031 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-032 | OBJ-05 | BR-005 | T-FR-032 | TS-UX/TS-POLICY | UX / v1 / BR-005 |
| FR-033 | OBJ-03 | BR-003 | T-FR-033 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-034 | OBJ-03 | BR-003 | T-FR-034 | TS-UX/TS-POLICY | UX / MVP / BR-003 |
| FR-035 | OBJ-01 | BR-001 | T-FR-035 | TS-UX/TS-POLICY | UX / v1 / BR-001 |
| FR-036 | OBJ-01 | BR-001 | T-FR-036 | TS-UX/TS-POLICY | UX / v1 fast-follow / BR-001 |
| FR-037 | OBJ-01 | BR-001 | T-FR-037 | TS-UX/TS-POLICY | UX / v1 / BR-001 |
| FR-038 | OBJ-01 | BR-001 | T-FR-038 | TS-UX/TS-POLICY | UX / v1 / BR-001 |
| FR-039 | OBJ-05 | BR-005 | T-FR-039 | TS-UX/TS-POLICY | UX / v1 / BR-005 |
| FR-040 | OBJ-02 | BR-002 | T-FR-040 | TS-CONNECTOR/TS-POLICY | integration / v1 / BR-002 |
| FR-041 | OBJ-02 | BR-002 | T-FR-041 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-002 |
| FR-042 | OBJ-06 | BR-006 | T-FR-042 | TS-CONNECTOR/TS-POLICY | integration / v1 / BR-006 |
| FR-043 | OBJ-02 | BR-002 | T-FR-043 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-002 |
| FR-044 | OBJ-02 | BR-002 | T-FR-044 | TS-CONNECTOR/TS-POLICY | integration / P0 then MVP / BR-002 |
| FR-045 | OBJ-02 | BR-002 | T-FR-045 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-002 |
| FR-046 | OBJ-03 | BR-003 | T-FR-046 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-003 |
| FR-047 | OBJ-03 | BR-003 | T-FR-047 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-003 |
| FR-048 | OBJ-03 | BR-003 | T-FR-048 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-003 |
| FR-049 | OBJ-03 | BR-003 | T-FR-049 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-003 |
| FR-050 | OBJ-02 | BR-002 | T-FR-050 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-002 |
| FR-051 | OBJ-05 | BR-005 | T-FR-051 | TS-UX/TS-CONNECTOR | operations / MVP / BR-005 |
| FR-052 | OBJ-06 | BR-006 | T-FR-052 | TS-UX/TS-PRIVACY | operations / v1 / BR-006 |
| FR-053 | OBJ-04 | BR-004 | T-FR-053 | TS-PRIVACY/TS-POLICY | security / MVP / BR-004 |
| FR-054 | OBJ-06 | BR-006 | T-FR-054 | TS-PRIVACY/TS-POLICY | security / MVP / BR-006 |
| FR-055 | OBJ-04 | BR-004 | T-FR-055 | TS-PRIVACY/TS-POLICY | security / v1 / BR-004 |
| FR-056 | OBJ-06 | BR-006 | T-FR-056 | TS-PRIVACY/TS-POLICY | operations / v1 / BR-006 |
| FR-057 | OBJ-06 | BR-006 | T-FR-057 | TS-PRIVACY/TS-POLICY | operations / MVP / BR-006 |
| FR-058 | OBJ-06 | BR-006 | T-FR-058 | TS-PRIVACY/TS-POLICY | product / MVP / BR-006 |
| FR-059 | OBJ-04 | BR-004 | T-FR-059 | TS-PRIVACY/TS-POLICY | security / MVP / BR-004 |
| FR-060 | OBJ-06 | BR-006 | T-FR-060 | TS-PACKAGE | operations / MVP manual; v1 channel / BR-006 |
| FR-061 | OBJ-05 | BR-005 | T-FR-061 | TS-UX | UX / MVP / BR-005 |
| FR-062 | OBJ-04 | BR-004 | T-FR-062 | TS-PRIVACY/TS-POLICY | operations / MVP / BR-004 |
| NFR-001 | OBJ-01 | BR-001 | T-NFR-001 | TS-STT/TS-FIELD | performance / P0 then MVP / BR-001 |
| NFR-002 | OBJ-01 | BR-001 | T-NFR-002 | TS-STT/TS-FIELD | speech + QA / MVP / BR-001 |
| NFR-003 | OBJ-03 | BR-003 | T-NFR-003 | TS-STT/TS-FIELD | QA / MVP / BR-003 |
| NFR-004 | OBJ-03 | BR-003 | T-NFR-004 | TS-POLICY | integration / MVP / BR-003 |
| NFR-005 | OBJ-05 | BR-005 | T-NFR-005 | TS-RESILIENCE | QA / MVP / BR-005 |
| NFR-006 | OBJ-05 | BR-005 | T-NFR-006 | TS-RESILIENCE | performance / P0 then MVP / BR-005 |
| NFR-007 | OBJ-04 | BR-004 | T-NFR-007 | TS-RESILIENCE | speech / MVP / BR-004 |
| NFR-008 | OBJ-03 | BR-003 | T-NFR-008 | TS-RESILIENCE | integration / MVP / BR-003 |
| NFR-009 | OBJ-05 | BR-005 | T-NFR-009 | TS-RESILIENCE | audio / MVP / BR-005 |
| NFR-010 | OBJ-04 | BR-004 | T-NFR-010 | TS-PRIVACY | security / MVP / BR-004 |
| NFR-011 | OBJ-04 | BR-004 | T-NFR-011 | TS-PRIVACY | security / MVP boundary; v2 cloud / BR-004 |
| NFR-012 | OBJ-06 | BR-006 | T-NFR-012 | TS-PRIVACY | security / P0 then MVP / BR-006 |
| NFR-013 | OBJ-05 | BR-005 | T-NFR-013 | TS-PACKAGE | desktop / MVP / BR-005 |
| NFR-014 | OBJ-06 | BR-006 | T-NFR-014 | TS-PACKAGE | desktop + ops / MVP manual; v1 channel / BR-006 |
| NFR-015 | OBJ-05 | BR-005 | T-NFR-015 | TS-UX/TS-FIELD | UX / MVP / BR-005 |
| NFR-016 | OBJ-05 | BR-005 | T-NFR-016 | TS-UX/TS-FIELD | UX / MVP / BR-005 |
| NFR-017 | OBJ-05 | BR-005 | T-NFR-017 | TS-UX/TS-FIELD | product + UX / MVP / BR-005 |
| NFR-018 | OBJ-06 | BR-006 | T-NFR-018 | TS-PRIVACY/TS-PACKAGE | maintainer / MVP / BR-006 |
| NFR-019 | OBJ-06 | BR-006 | T-NFR-019 | TS-PRIVACY/TS-PACKAGE | operations / MVP / BR-006 |
| NFR-020 | OBJ-06 | BR-006 | T-NFR-020 | TS-PRIVACY/TS-PACKAGE | security / MVP onward / BR-006 |
| NFR-021 | OBJ-06 | BR-006 | T-NFR-021 | TS-PRIVACY/TS-PACKAGE | licensing / P0 then MVP / BR-006 |
| NFR-022 | OBJ-02 | BR-002 | T-NFR-022 | TS-RESILIENCE/TS-FIELD | operations / MVP / BR-002 |
| NFR-023 | OBJ-04 | BR-004 | T-NFR-023 | TS-PRIVACY/TS-RESILIENCE | sponsor / MVP / BR-004 |
| NFR-024 | OBJ-03 | BR-003 | T-NFR-024 | TS-CONNECTOR/TS-POLICY | integration / MVP / BR-003 |

## Cross-cutting trace and audit rules

- P0 IT-01–13 covers BR-002 and FR-041–050/NFR-001/004/006/012/021/024. P0 must establish a supportable arbitrary route before implementation readiness.
- Corpus UT-001–066 covers parser/intent/context/translation/expiry/source negatives: FR-010–025 and send-gating FR-028–034/043/047–050. Synthetic corpus is not NFR-002/003 real-audio evidence.
- Hazard H-01–16 controls in docs/11 link individual tests and residual risks; R-01–14/D-01–12 in docs/07 own unresolved blockers; ADR-001–010 trace decisions to scope and test gates.
- Release phase remains in each requirement. Any waiver must revise requirement/matrix/test plan and obtain IFC acceptance; no later-phase requirement silently removed. All requirement-specific acceptance cases use the full Given/When/Then or NFR method, not a mirrored implementation assertion.
- Audit expects exactly 62 unique FR and 24 unique NFR IDs, one row and acceptance case each, every BR connected to an objective and tests, no unknown test suite or missing owner/release. Runtime pass counts remain zero.

