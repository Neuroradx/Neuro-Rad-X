/**
 * @file PubMed E-utilities API helpers.
 * Runs the AI-generated query (esearch) and fetches the first article's title via esummary.
 * @see https://www.ncbi.nlm.nih.gov/books/NBK25499/
 */

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract?: string;
  url: string;
}

/**
 * Search PubMed with a query string; returns up to 5 PMIDs.
 */
export async function searchPubMed(query: string, retmax = 5): Promise<string[]> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${retmax}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const data = await res.json();
  const idlist = data?.esearchresult?.idlist;
  return Array.isArray(idlist) ? idlist : [];
}

/**
 * Fetch article summaries (title, etc.) for given PMIDs using ESummary.
 * Returns the first successfully parsed article.
 */
export async function fetchPubMedArticles(pmids: string[]): Promise<PubMedArticle | null> {
  if (pmids.length === 0) return null;
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.result;
  if (!result || typeof result !== 'object') return null;
  const uid = result.uids?.[0] ?? pmids[0];
  const art = result[uid];
  if (!art || typeof art !== 'object') return null;
  const title = typeof art.title === 'string' ? art.title : '';
  const pmid = String(art.uid ?? uid);
  return {
    pmid,
    title: title || 'PubMed article',
    abstract: undefined,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
}

/**
 * Run query and return the first article, or null if none.
 */
export async function findFirstPubMedArticle(query: string): Promise<PubMedArticle | null> {
  const ids = await searchPubMed(query, 3);
  return fetchPubMedArticles(ids);
}
