import { makeSource, defineDocumentType } from 'contentlayer2/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    date: {
      type: 'date',
      required: true,
    },
    excerpt: {
      type: 'string',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },
    published: {
      type: 'boolean',
      default: false,
    },
    locale: {
      type: 'enum',
      options: ['en', 'vi'],
      required: true,
    },
    coverImage: {
      type: 'string',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => {
        const parts = doc._raw.flattenedPath.split('/');
        return parts[parts.length - 1];
      },
    },
    url: {
      type: 'string',
      resolve: (doc) => {
        const parts = doc._raw.flattenedPath.split('/');
        const slug = parts[parts.length - 1];
        const locale = doc.locale;
        return `/${locale}/blog/${slug}`;
      },
    },
    readingTime: {
      type: 'json',
      resolve: (doc) => readingTime(doc.body.raw),
    },
  },
}));

export default makeSource({
  contentDirPath: '../keystatic-admin/content',
  documentTypes: [Post],
  disableImportAliasWarning: true,
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
          keepBackground: true,
          defaultLang: 'plaintext',
        },
      ],
    ],
  },
});
