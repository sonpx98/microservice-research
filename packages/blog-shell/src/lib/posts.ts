import { allPosts } from 'contentlayer/generated';

export function getAllPosts(locale: string) {
  return allPosts
    .filter(post => post.locale === locale && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale: string) {
  return allPosts.find(post => post.slug === slug && post.locale === locale);
}

export function getAllTags(locale: string) {
  const posts = getAllPosts(locale);
  const tags = new Set<string>();
  
  posts.forEach(post => {
    post.tags?.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string, locale: string) {
  return getAllPosts(locale).filter(post => post.tags?.includes(tag));
}
