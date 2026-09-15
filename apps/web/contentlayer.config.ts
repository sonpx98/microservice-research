import { makeSource, defineDocumentType } from 'contentlayer2/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Hash file để detect changes
function getFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (e) {
    return '';
  }
}

// Cache file path - lưu trên git để Vercel có thể dùng
const CACHE_FILE = path.join(process.cwd(), '.contentlayer-cache.json');
let fileCache: Record<string, { hash: string }> = {};

try {
  if (fs.existsSync(CACHE_FILE)) {
    fileCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log('✅ Loaded cache with', Object.keys(fileCache).length, 'files');
  }
} catch (e) {
  console.log('⚠️  No cache found, generating new...');
}

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
    slug: {
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

export const KnowledgeGraphNode = defineDocumentType(() => ({
  name: 'KnowledgeGraphNode',
  filePathPattern: `knowledge-graph/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    category: {
      type: 'string',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },
    relationships: {
      type: 'json',
      default: [],
    },
    locale: {
      type: 'string',
      required: true,
    },
  },
  computedFields: {
    id: {
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
        const id = parts[parts.length - 1];
        return `/knowledge-graph/${id}`;
      },
    },
  },
}));

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Post, KnowledgeGraphNode],
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
  onSuccess: async () => {
    // Create required directories for contentlayer output
    const generatedDir = path.join(process.cwd(), '.contentlayer', 'generated');
    const dirs = [
      path.join(generatedDir, 'technical'),
      path.join(generatedDir, 'issue'),
      path.join(generatedDir, 'slang'),
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Save cache file cho lần build tiếp theo
    const newCache: Record<string, { hash: string }> = {};
    
    let cachedFiles = 0;
    let parsedFiles = 0;
    
    // Get all posts từ content directory
    const contentDir = path.join(process.cwd(), 'content', 'posts');
    const postFiles: string[] = [];
    
    // Scan all markdown files recursively
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.md')) {
          postFiles.push(fullPath);
        }
      });
    };
    
    scanDir(contentDir);
    
    postFiles.forEach((filePath) => {
      const currentHash = getFileHash(filePath);
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Check if file changed
      if (fileCache[relativePath]?.hash === currentHash) {
        cachedFiles++;
      } else {
        parsedFiles++;
      }
      
      newCache[relativePath] = {
        hash: currentHash,
      };
    });
    
    // Write cache file to project root (not in .contentlayer which is git-ignored)
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newCache, null, 2));
    
    console.log('📊 Cache Stats:');
    console.log(`   ✅ Cached files: ${cachedFiles}`);
    console.log(`   🔄 Parsed files: ${parsedFiles}`);
    console.log(`   📁 Total files: ${postFiles.length}`);
    console.log(`   💾 Cache saved to: ${CACHE_FILE}`);
  },
});
