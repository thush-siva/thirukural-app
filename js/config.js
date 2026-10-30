/*
 * Design settings per section. Content (kurals, chapter names) lives in
 * data/, built by scripts/build_data.py.
 *
 * To give a chapter its own artwork, add it to `chapterArt`, keyed by
 * chapter number:  chapterArt: { 40: 'assets/chapters/040.jpg' }
 */
window.KURAL_CONFIG = {
  placeholderArt: 'assets/chapter-placeholder.jpg',
  chapterArt: {},
  sections: {
    virtue: { ta: 'அறம்', cover: '#1E5E4A', spine: '#154535', deep: '#0B1F18', glow: '#2E8A6B', card: '#1E5E4A', cardRgb: '30,94,74', ground: '#0B1F18' },
    wealth: { ta: 'பொருள்', cover: '#99581A', spine: '#744112', deep: '#211508', glow: '#C9822B', card: '#8F5318', cardRgb: '143,83,24', ground: '#211508' },
    love: { ta: 'இன்பம்', cover: '#8E2F45', spine: '#6C2133', deep: '#1F0910', glow: '#BF4864', card: '#8E2F45', cardRgb: '142,47,69', ground: '#1F0910' }
  }
};
