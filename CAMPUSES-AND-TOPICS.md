# Using the timeline at another campus, or for another topic

## Show your own library's records

Every card cites items from Reed Library at SUNY Fredonia. A campus that embeds the timeline can show its own catalog records on each card instead.

1. Run the harvest for your campus (Primo VE campuses only, for now):

   ```
   python source/harvest_campus.py --inst 01SUNY_GEN --name "Milne Library" --host https://suny-gen.primo.exlibrisgroup.com --search-label "Milne Library's catalog"
   ```

   For each card, the script searches your catalog for the works the card cites (by title and author) and for the card's tested search terms. It keeps only records your library has on the shelf or online with full text. The result is saved as `dist/campus/<your institution code>.json`.

2. Add `data-campus="<your institution code>"` to the `<section id="ail-tl">` tag in the embed snippet.

Readers then see "In [your library]'s collection" with your records, search links into your catalog, and the works the card cites, each with a link to search your catalog for it.

The harvest runs on a computer, not in the reader's browser, because library catalogs do not accept searches sent from other websites. Run it again each term, or after new cards are added.

Tested: SUNY Albany, Binghamton, Fredonia, Geneseo, Oswego and Potsdam accept the guest search the script uses. Buffalo and New Paltz use a different address, which has not been looked up yet.

## Library of Congress subject links

A card can carry Library of Congress headings in an `lc` field, for example `{"label": "Frankenstein (novel)", "heading": "Shelley, Mary Wollstonecraft, 1797-1851. Frankenstein"}`. The card then shows a "Subject:" link that runs an exact subject search in the reader's catalog. Headings come from Wikidata (property P244, the Library of Congress authority ID) and id.loc.gov. Most libraries use the same headings, so the link works in any catalog that uses LCSH.

## Comparing headlines

A card can list how several outlets headlined the same event in a `headlines` field: `[{"outlet", "headline", "url", "date"}]`. The order is shuffled on every visit. Readers choose "Headlines: one at random" (one headline on the card) or "Headlines: all, stacked" (every headline on the card). The "Sources and links" panel always lists all of them.

## A timeline for another topic

The same timeline can show any topic. Put a topic file next to the data and point the embed's `data-src` at it. A topic file has two parts:

- `topic`: the title, the topic buttons (`tracks`), and optionally its own background photos (`photos`), board colors (`boards`) and suggestion sheet (`sheet`).
- `cards`: the milestones. A card with `"open": true` is an open slot: it shows with a dashed outline and holds the place until someone writes it.

See `topics/TEMPLATE-blooms-taxonomy.json`. Open slots carry only a year, a title and search terms; the contributor researches and writes the rest (see `CONTRIBUTING.md`).
