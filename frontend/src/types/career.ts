export type CareerArticle = {
  slug: string;
  title: string;
  category: string;
  categoryId: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageSource: string;
  intro: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
};
