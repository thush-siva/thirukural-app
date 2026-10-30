/* Scenario search. Runs fully on the device, no server.
   A person describes their situation in plain words. The query is matched two ways:
   1. Themes: everyday words ("boss", "breakup", "exam") map to the chapters that speak to them.
   2. Text: BM25 ranking over each kural's English meaning and chapter title.
   Theme chapters get a strong boost; the text score orders kurals within them. */
(() => {
  'use strict';

  // label, everyday trigger words, words the English meanings tend to use, chapters (best first)
  const THEMES = [
    ['Anger', 'anger angry mad furious rage temper annoyed irritated frustrated frustration snap yell shout', 'anger wrath rage', [31, 16, 13]],
    ['Patience', 'patience patient wait waiting forgive forgiveness tolerate insult insulted hurt wronged offended disrespected', 'patience forbear forgive bear injury', [16, 31, 100]],
    ['Work', 'work job boss manager office colleague coworker career employer promotion workplace meeting client company team', 'king service serve minister', [70, 71, 72, 64, 66, 52]],
    ['Criticism', 'criticise criticize criticised criticized criticism feedback blamed blame scolded review performance', 'faults correct reproach', [44, 70, 45, 16]],
    ['Speaking up', 'speak speech presentation present interview public pitch talk conversation nervous audience stage', 'speech words assembly council speak', [65, 73, 72, 69]],
    ['Leadership', 'lead leader leadership manage managing hire hiring employ delegate team staff run business founder', 'king employ choose rule sceptre', [52, 51, 55, 39, 58]],
    ['Decisions', 'decide decision choice choose plan planning strategy option risk startup venture quit quitting business', 'consider act undertake deed', [47, 48, 67, 68, 49]],
    ['Timing', 'timing moment opportunity rush rushing hurry patient delay timely', 'time season opportunity', [49, 50, 48]],
    ['Money', 'money finance finances wealth rich save saving savings spend spending budget invest investing income earn salary afford', 'wealth riches property', [76, 101, 48, 103]],
    ['Hard times', 'poor poverty broke debt debts struggling struggle laid unemployed lost hardship bills', 'poverty want indigence', [105, 63, 107, 106]],
    ['Setbacks', 'fail failed failure setback stress stressed overwhelmed trouble difficult difficulty hopeless despair down sad defeated rejected rejection', 'trouble sorrow misfortune affliction', [63, 62, 60, 38]],
    ['Motivation', 'lazy laziness procrastinate procrastinating procrastination unmotivated motivation tired sluggish distracted', 'sloth idleness laziness', [61, 60, 62]],
    ['Effort', 'effort goal goals ambition persevere perseverance discipline grind try trying achieve achievement success dream', 'effort labour exertion energy', [62, 60, 67, 54]],
    ['Friendship', 'friend friends friendship buddy bestfriend companion', 'friend friendship', [79, 81, 80]],
    ['Betrayal', 'betray betrayed betrayal fake backstab backstabbed trust trusted lied cheated used toxic disloyal', 'false friend deceit', [83, 82, 80, 89, 51]],
    ['Bad company', 'influence pressure peer crowd hang circle associate', 'mean associate company', [46, 82, 84]],
    ['Loneliness', 'lonely loneliness alone isolated isolation nobody', 'solitary alone', [120, 79, 8]],
    ['Grief', 'grief grieve grieving death died dying passed loss mourning funeral', 'death birth body transient', [34, 35]],
    ['Love', 'love crush romance romantic attraction attracted dating date beautiful beauty', 'love beloved maid', [109, 110, 113, 112, 127]],
    ['Missing someone', 'miss missing breakup broke heartbreak heartbroken apart distance separated separation away ex', 'separation absence grief eyes', [116, 129, 120, 121, 118, 122]],
    ['Partner conflict', 'fight fighting argument argue partner spouse wife husband girlfriend boyfriend sulk upset quarrel', 'sulk dislike quarrel', [131, 132, 133, 130]],
    ['Marriage', 'marriage married wedding spouse wife husband household home', 'wife household domestic', [6, 5, 8]],
    ['Family', 'family parent parents mother father mom dad child children kid kids son daughter parenting relative relatives sibling brother sister', 'children kindred relations', [7, 53, 103, 5]],
    ['Kindness', 'kind kindness compassion compassionate help helping charity volunteer care caring empathy', 'kindness grace love compassion', [25, 8, 22, 23]],
    ['Giving', 'give giving generous generosity donate donation share sharing gift', 'give gift', [23, 22, 101]],
    ['Hospitality', 'guest guests visitor visitors host hosting hospitality welcome', 'guest', [9]],
    ['Gratitude', 'grateful gratitude thank thanks thankful favour favor appreciate appreciation', 'benefit help', [11]],
    ['Gossip', 'gossip gossiping rumour rumor backbite behind slander talking', 'slander backbite', [19, 20, 115]],
    ['Words', 'words rude harsh mean insult insulting argument argue polite kind sweet tongue', 'words sweet speech', [10, 20, 65]],
    ['Honesty', 'honest honesty lie lying lies truth truthful cheat cheating integrity fraud', 'truth falsehood fraud', [30, 29, 28, 66]],
    ['Envy', 'envy envious jealous jealousy compare comparing comparison', 'envy', [17, 18]],
    ['Greed', 'greed greedy desire desires craving want wanting covet', 'desire covet', [18, 37, 35]],
    ['Ego', 'ego pride proud arrogant arrogance humble humility boast boasting showoff', 'pride humility self', [13, 98, 97, 14]],
    ['Reputation', 'reputation respect respected fame famous honour honor shame ashamed embarrassed embarrassing dignity', 'honour fame shame', [24, 97, 102, 96]],
    ['Mistakes', 'mistake mistakes regret regrets apologise apologize apology sorry wrong error fix', 'faults evil', [44, 47, 21, 66]],
    ['Learning', 'learn learning study studying exam exams test school university college education student read reading book books knowledge', 'learning learned knowledge', [40, 43, 41, 42]],
    ['Advice', 'advice advise mentor guidance guide counsel listen listening wise elder elders', 'hear wise great men', [42, 45, 46]],
    ['Courage', 'fear afraid scared anxiety anxious worry worried worrying courage brave nervous panic', 'fear dread', [63, 73, 78, 21]],
    ['Health', 'health healthy sick illness ill doctor medicine food diet eat eating overeat body', 'food disease medicine', [95]],
    ['Drinking', 'drink drinking alcohol drunk addiction addicted', 'drink palm wine', [93]],
    ['Gambling', 'gamble gambling bet betting casino lottery', 'gambling dice', [94]],
    ['Self-control', 'control discipline temptation tempted impulse restraint self', 'restrain senses self', [13, 37, 93]],
    ['Fate', 'fate luck lucky unlucky destiny unfair', 'fate destiny', [38, 63]],
    ['Letting go', 'detach detachment simplify minimal minimalism renounce attachment attached possessions', 'renunciation desire', [35, 34, 37]],
    ['Faith', 'god faith pray prayer spiritual spirituality worship', 'god feet', [1, 3, 36]],
    ['Courtesy', 'courtesy manners etiquette polite politeness respectful', 'courtesy', [100, 14, 10]],
    ['Persuasion', 'negotiate negotiation persuade persuasion convince deal sales sell', 'envoy speech', [69, 65, 71]],
    ['Reading people', 'read signals signs body language hints intention intentions', 'signs look face', [71, 110, 128]],
    ['Fairness', 'fair fairness unfair justice bias biased favoritism impartial equal', 'impartial justice equity', [12, 55]],
    ['Power', 'power authority bully bullied bullying abuse tyrant oppress', 'cruel sceptre tyranny', [56, 57, 55, 90]],
    ['Harm', 'hurt harm violence violent revenge kill', 'injury harm evil', [32, 33, 21]],
    ['Asking for help', 'borrow borrowing beg ask asking loan favour', 'beg', [106, 107]],
    ['Community', 'community society duty neighbour neighbor neighbours neighbors citizen', 'duty world', [22, 96]],
    ['Carelessness', 'careless forget forgetful complacent complacency', 'forget', [54]],
    ['Foolishness', 'fool foolish stupid silly ignorance ignorant', 'fool folly ignorant', [84, 85, 41]],
    ['Nature', 'rain nature environment farming farm garden climate', 'rain', [2, 104]]
  ];

  const STOP = new Set(('a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves im ive dont cant feel feeling feels really get got getting keep something someone thing things like know want also still much even always never lot').split(' '));

  function stem(w) {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -1);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  }
  const PHRASES = [
    [/let (me|us|him|her|them) down|let down/g, ' betrayed '], [/passed away/g, ' died '], [/broke up|broken up|break up/g, ' breakup '],
    [/in front of/g, ' publicly '], [/stressed out/g, ' stressed '], [/give up|giving up/g, ' hopeless '], [/hard time/g, ' difficult ']
  ];
  function words(text) {
    text = text.toLowerCase();
    PHRASES.forEach(([re, to]) => { text = text.replace(re, to); });
    return (text.replace(/[’']/g, '').match(/[a-z]+/g) || []).filter((w) => w.length > 1 && !STOP.has(w));
  }
  const toks = (text) => words(text).map(stem);

  // Context words (where it happens) rank below what the person is going through
  const CONTEXT = new Set(['Work', 'Leadership', 'Family', 'Marriage', 'Learning', 'Friendship', 'Speaking up', 'Health', 'Community', 'Nature', 'Faith', 'Money']);
  const themes = THEMES.map(([label, trig, terms, chapters], i) => ({
    label, chapters, i, ctx: CONTEXT.has(label),
    trig: new Set(trig.split(' ').map(stem)),
    terms: terms.split(' ').map(stem)
  }));

  let docs = null, df = null, avgLen = 0, chapterTitles = {};

  function build(rows, titles) {
    chapterTitles = titles;
    df = new Map();
    let total = 0;
    docs = rows.map(([n, c, ta, m]) => {
      const t = toks(m).concat(toks(titles[c] || ''), toks(titles[c] || ''));
      const tf = new Map();
      t.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
      tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1));
      total += t.length;
      return { n, c, ta, m, tf, len: t.length };
    });
    avgLen = total / docs.length;
  }

  function bm25(doc, terms) {
    const N = docs.length, k1 = 1.2, b = 0.75;
    let s = 0;
    terms.forEach(([w, weight]) => {
      const f = doc.tf.get(w);
      if (!f) return;
      const d = df.get(w) || 0;
      const idf = Math.log(1 + (N - d + 0.5) / (d + 0.5));
      s += weight * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * doc.len / avgLen));
    });
    return s;
  }

  function query(text, limit = 12) {
    if (!docs) return { results: [], themes: [] };
    const q = toks(text);
    if (!q.length) return { results: [], themes: [] };
    const qset = new Set(q);
    const hit = themes
      .map((t) => {
        const raw = q.filter((w) => t.trig.has(w)).length;
        return { t, score: raw ? (t.ctx ? Math.min(raw, 1.5) : raw + 1) : 0 };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => (b.score - a.score) || (a.t.i - b.t.i))
      .slice(0, 3);

    const terms = new Map();
    q.forEach((w) => terms.set(w, 1));
    hit.forEach(({ t }) => t.terms.forEach((w) => { if (!terms.has(w)) terms.set(w, 0.6); }));
    const termList = [...terms];

    // Each kural belongs to the strongest theme that covers its chapter
    const owner = new Map();
    hit.forEach(({ t }, ti) => t.chapters.forEach((c, ci) => {
      const v = (6 - ti * 1.2) * (1 - ci * 0.12);
      if (!owner.has(c) || owner.get(c).v < v) owner.set(c, { ti, v });
    }));

    const buckets = hit.map(() => []), rest = [];
    docs.forEach((d) => {
      const text = bm25(d, termList);
      const o = owner.get(d.c);
      const s = text + (o ? o.v : 0);
      if (s <= 0.5) return;
      (o ? buckets[o.ti] : rest).push({ d, s });
    });
    buckets.forEach((b) => b.sort((a, b2) => b2.s - a.s));
    rest.sort((a, b) => b.s - a.s);

    // Mix themes: the main theme gets two picks per round, others one. At most 3 per chapter.
    const per = new Map(), out = [];
    const take = (x) => {
      const k = per.get(x.d.c) || 0;
      if (k >= 3) return false;
      per.set(x.d.c, k + 1);
      out.push({ n: x.d.n, c: x.d.c, ta: x.d.ta, m: x.d.m, chapter: chapterTitles[x.d.c] });
      return true;
    };
    const pos = buckets.map(() => 0);
    let progress = true;
    while (out.length < limit && progress) {
      progress = false;
      buckets.forEach((b, bi) => {
        let want = bi === 0 ? 2 : 1;
        while (want > 0 && pos[bi] < b.length && out.length < limit) {
          if (take(b[pos[bi]++])) want--;
          progress = true;
        }
      });
    }
    for (const x of rest) { if (out.length >= limit) break; take(x); }
    return { results: out, themes: hit.map((h) => h.t.label), matchedWords: qset.size };
  }

  let loading = null;
  function load(titles) {
    if (docs) return Promise.resolve();
    if (!loading) {
      loading = fetch('data/search.json').then((r) => {
        if (!r.ok) throw new Error('Search data did not load');
        return r.json();
      }).then((rows) => { build(rows, titles); return rows; })
        .catch((e) => { loading = null; throw e; });
    }
    return loading;
  }
  function get(n) { return docs ? docs[n - 1] : null; }

  window.KuralSearch = { load, query, get };
})();
