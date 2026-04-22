import type { CategorySummary } from "../lib/catalog-types";

export interface NLUIntent {
  q: string;
  category: string;
  price: string;
  tag: string;
}

interface KeywordCandidate {
  slug: string;
  keywords: string[];
}

const STATIC_CATEGORY_KEYWORDS: KeywordCandidate[] = [
  { slug: "image", keywords: ["图像", "图片", "画图", "绘图", "修图", "海报", "设计"] },
  { slug: "writing", keywords: ["文本", "文案", "写作", "文章", "改写", "翻译", "总结"] },
  { slug: "video", keywords: ["视频", "剪辑", "字幕", "短视频", "转场"] },
  { slug: "coding", keywords: ["代码", "编程", "开发", "debug", "调试", "测试"] },
  { slug: "office", keywords: ["ppt", "表格", "文档", "办公", "会议纪要"] },
];

const PRICE_KEYWORDS: KeywordCandidate[] = [
  { slug: "free", keywords: ["免费", "白嫖", "零元", "不用钱", "不花钱"] },
  { slug: "freemium", keywords: ["免费增值", "先免费后付费", "试用版"] },
  { slug: "subscription", keywords: ["订阅", "按月", "按年", "月付", "年付", "付费"] },
  { slug: "one-time", keywords: ["买断", "一次性", "终身"] },
  { slug: "contact", keywords: ["联系销售", "报价", "询价"] },
];

const FILLER_PATTERN = /(推荐|工具|软件|平台|帮我|帮忙|给我|我想|我需要|请问|有哪些|哪个|什么|找|有没有|这类的|的)/gu;

function normalizeInput(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[，。！？、；,.!?;:()（）【】[\]"'“”‘’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKeyword(value: string) {
  return normalizeInput(value).replace(/\s+/g, "");
}

function buildDynamicCategoryKeywords(categories: CategorySummary[] = []): KeywordCandidate[] {
  return categories.map((category) => {
    const rawKeywords = new Set<string>([
      category.name,
      category.slug,
      category.canonicalSlug || "",
      ...(category.legacySlugs ?? []),
    ]);

    const keywords = Array.from(rawKeywords)
      .map((item) => normalizeKeyword(item))
      .filter((item) => item.length >= 2);

    return { slug: category.canonicalSlug || category.slug, keywords };
  });
}

function extractKeywordMatches(text: string, candidates: KeywordCandidate[]) {
  const matches: Array<{ slug: string; matchedKeyword: string }> = [];

  for (const candidate of candidates) {
    for (const keyword of candidate.keywords) {
      if (keyword && text.includes(keyword)) {
        matches.push({ slug: candidate.slug, matchedKeyword: keyword });
        break;
      }
    }
  }

  return matches;
}

export function parseSearchIntent(input: string, categories: CategorySummary[] = []): NLUIntent {
  const result: NLUIntent = {
    q: "",
    category: "",
    price: "",
    tag: "",
  };

  if (!input?.trim()) {
    return result;
  }

  let normalized = normalizeInput(input);
  let remainingCompact = normalizeKeyword(input);

  const tagMatch = normalized.match(/#([\p{L}\p{N}_-]+)/u);
  if (tagMatch?.[1]) {
    result.tag = tagMatch[1];
    normalized = normalized.replace(tagMatch[0], " ").trim();
    remainingCompact = normalizeKeyword(normalized);
  }

  const priceMatches = extractKeywordMatches(remainingCompact, PRICE_KEYWORDS);
  if (priceMatches.length > 0) {
    result.price = priceMatches[0].slug;
    remainingCompact = remainingCompact.replace(priceMatches[0].matchedKeyword, "");
  }

  const dynamicMatches = extractKeywordMatches(remainingCompact, buildDynamicCategoryKeywords(categories));
  if (dynamicMatches.length === 1) {
    result.category = dynamicMatches[0].slug;
    remainingCompact = remainingCompact.replace(dynamicMatches[0].matchedKeyword, "");
  } else if (dynamicMatches.length === 0) {
    const staticMatches = extractKeywordMatches(remainingCompact, STATIC_CATEGORY_KEYWORDS);
    if (staticMatches.length === 1) {
      result.category = staticMatches[0].slug;
      remainingCompact = remainingCompact.replace(staticMatches[0].matchedKeyword, "");
    }
  }

  result.q = normalizeInput(remainingCompact).replace(FILLER_PATTERN, " ").replace(/\s+/g, " ").trim();
  return result;
}
