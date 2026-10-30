#!/usr/bin/env python3
"""Build the app's content files from the vendored Thirukkural dataset.

Reads:
  data-src/vendor/tk120404/thirukkural.json   All 1,330 kurals (Apache 2.0)
  data-src/vendor/tk120404/detail.json        Sections and chapter names
  data-src/glosses.json                        Draft word-by-word glosses

Writes:
  data/index.json             Sections and chapters, loaded at start
  data/chapters/NNN.json      One file per chapter, loaded when opened

Run from the repo root:  python3 scripts/build_data.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data-src')
OUT = os.path.join(ROOT, 'data')

SECTION_IDS = {1: ('virtue', 'I'), 2: ('wealth', 'II'), 3: ('love', 'III')}


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


SMALL_WORDS = {'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with'}


def title_case(s):
    s = s.replace('"s ', "'s ")
    out = []
    for i, w in enumerate(s.split()):
        if w.isupper():
            out.append(w)
        elif i > 0 and w.lower() in SMALL_WORDS:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    return ' '.join(out)


# Short English names for the parts (iyal) of each section, for tabs
PART_NAMES = {
    'Minister of State': 'Ministers', 'The Essentials of a State': 'The State', 'Way of Making Wealth': 'Wealth',
    'The Excellence of an Army': 'The Army', 'Miscellaneous': 'Citizenship',
    'The Pre-marital love': 'Courtship', 'The Post-marital love': 'Marriage'
}


def tokens(line, translit, glossed):
    """Split one Tamil line into words, pairing each with its transliteration."""
    words = line.split()
    trs = translit.split()
    aligned = len(words) == len(trs)
    out = []
    for i, w in enumerate(words):
        out.append([w, trs[i].lower() if aligned else None, None])
    return out


def main():
    kurals = {k['Number']: k for k in load(os.path.join(SRC, 'vendor/tk120404/thirukkural.json'))['kural']}
    detail = load(os.path.join(SRC, 'vendor/tk120404/detail.json'))[0]['section']['detail']
    glosses = load(os.path.join(SRC, 'glosses.json'))['kurals']

    os.makedirs(os.path.join(OUT, 'chapters'), exist_ok=True)
    index = {'sections': []}
    search = []
    glossed_count = 0

    for sec in detail:
        sid, num = SECTION_IDS[sec['number']]
        section = {
            'id': sid, 'num': num, 'taBook': sec['name'], 'en': sec['translation'],
            'tr': sec['transliteration'], 'chapters': [], 'parts': []
        }
        for group in sec['chapterGroup']['detail']:
            gch = group['chapters']['detail']
            section['parts'].append({
                'ta': group['name'].replace('படையில்', 'படையியல்'), 'en': PART_NAMES.get(group['translation'], group['translation']),
                'first': gch[0]['number'], 'last': gch[-1]['number']
            })
            for ch in group['chapters']['detail']:
                n = ch['number']
                chapter_kurals = []
                has_glosses = True
                for kn in range(ch['start'], ch['end'] + 1):
                    k = kurals[kn]
                    if str(kn) in glosses:
                        lines = glosses[str(kn)]
                        glossed_count += 1
                    else:
                        has_glosses = False
                        lines = [tokens(k['Line1'], k['transliteration1'], False),
                                 tokens(k['Line2'], k['transliteration2'], False)]
                    search.append([kn, n, k['Line1'] + '\n' + k['Line2'], k['explanation'].strip()])
                    chapter_kurals.append({
                        'n': kn,
                        'l': lines,
                        'tr': k['transliteration1'] + ' / ' + k['transliteration2'],
                        'm': k['explanation'].strip(),
                        # Plain-Tamil explanation: Mu. Varadarasanar's commentary (his works are nationalised in Tamil Nadu)
                        'u': (k.get('mv') or '').strip(),
                        'glossed': str(kn) in glosses
                    })
                chapter = {
                    'num': n, 'ta': ch['name'], 'en': title_case(ch['translation']),
                    'tr': ch['transliteration'], 'group': group['translation'],
                    'section': sid, 'kurals': chapter_kurals
                }
                with open(os.path.join(OUT, 'chapters', '%03d.json' % n), 'w', encoding='utf-8') as f:
                    json.dump(chapter, f, ensure_ascii=False, separators=(',', ':'))
                section['chapters'].append({
                    'n': n, 'ta': ch['name'], 'en': chapter['en'], 'tr': ch['transliteration'],
                    'start': ch['start'], 'end': ch['end'], 'glossed': has_glosses
                })
        index['sections'].append(section)

    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, separators=(',', ':'))

    # Compact index for search and the Saved screen: [number, chapter, Tamil, meaning]
    with open(os.path.join(OUT, 'search.json'), 'w', encoding='utf-8') as f:
        json.dump(search, f, ensure_ascii=False, separators=(',', ':'))

    total = sum(len(s['chapters']) for s in index['sections'])
    print('Sections: %d, chapters: %d, kurals: %d, with word glosses: %d'
          % (len(index['sections']), total, len(kurals), glossed_count))


if __name__ == '__main__':
    main()
