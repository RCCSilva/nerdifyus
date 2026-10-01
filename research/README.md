# Research notes

One folder per topic, each with:
- `sources.md`: every source, with an ID
- `raw/`: downloaded PDFs (the archived copies we cite)
- `NN-<subject>.md`: notes, ordered basic → advanced

Every claim comes from a reference. Never from memory or prior knowledge.
Official sources come first (for the NFL: the rulebook PDF and operations.nfl.com). Explainer sites are the fallback.

## sources.md format

```markdown
| ID | Source | Type | Version / date | Location |
|----|--------|------|----------------|----------|
| S1 | 2026 NFL Rulebook (PDF) | primary | 2026 season | raw/2026-nfl-rulebook.pdf · <original URL> |
```

## Citation format

- Rulebook: `[S1 R11-1-2, p.49]` = source S1, Rule 11, Section 1, Article 2, PDF page 49
- Web page: `[S2]`, plus the term or heading when the page is long: `[S2 "Touchback"]`
- Real example: `[S7 — 2025 Wk 3 KC@NYG, Q4 1:52]`

## Note format

```markdown
# <Subject>
Level: basic | intermediate | advanced
Applies to: <season/year>

## <Concept>
Plain-language explanation. Every factual sentence ends with its source: [S1 R4-1-1, p.18].
Example: <a concrete situation or worked calculation, with its reference>

## Source conflicts
## Open questions / UNVERIFIED
```
