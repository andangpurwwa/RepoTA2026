const { normalizeText } = require('./similarity');

async function categorizeRepository(client, title = '', abstract = '') {
  const keywordResult = await client.query(`
    SELECT k.keyword, k.category_id, c.name AS category_name
    FROM keywords k
    JOIN categories c ON c.id = k.category_id
  `);

  const text = normalizeText(`${title} ${abstract}`);
  const scores = new Map();

  keywordResult.rows.forEach((row) => {
    const keyword = normalizeText(row.keyword);
    if (!keyword) return;

    const key = row.category_id;
    const hit = text.includes(keyword) ? 2 : keyword.split(' ').filter((part) => text.includes(part)).length;
    if (hit > 0) {
      const current = scores.get(key) || { category_id: row.category_id, category_name: row.category_name, score: 0 };
      current.score += hit;
      scores.set(key, current);
    }
  });

  const ranked = [...scores.values()].sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

module.exports = { categorizeRepository };
