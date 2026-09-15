import { config, fields, collection } from "@keystatic/core";

// keystatic.config.tsx - Integrated into blog-shell
export default config({
  storage: {
    kind: "github",
    repo: {
      owner: "sonpx98",
      name: "microservice-research",
    },
  },

  collections: {
    postsEn: collection({
      label: "Blog Posts (English)",
      slugField: "slug",
      path: "packages/blog-shell/content/posts/en/*",
      format: {
        contentField: "content",
      },
      entryLayout: "content",
      schema: {
        slug: fields.slug({
          name: { label: "Slug" },
        }),
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: "Published Date",
          defaultValue: { kind: "today" },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        published: fields.checkbox({
          label: "Published",
          defaultValue: false,
        }),
        locale: fields.text({
          label: "Locale",
          defaultValue: "en",
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "packages/blog-shell/public/images/posts",
              publicPath: "/images/posts/",
            },
          },
        }),
      },
    }),

    postsVi: collection({
      label: "Blog Posts (Tiếng Việt)",
      slugField: "slug",
      path: "packages/blog-shell/content/posts/vi/*",
      format: {
        contentField: "content",
      },
      entryLayout: "content",
      schema: {
        slug: fields.slug({
          name: { label: "Slug" },
        }),
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: "Published Date",
          defaultValue: { kind: "today" },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        published: fields.checkbox({
          label: "Published",
          defaultValue: false,
        }),
        locale: fields.text({
          label: "Locale",
          defaultValue: "vi",
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "packages/blog-shell/public/images/posts",
              publicPath: "/images/posts/",
            },
          },
        }),
      },
    }),

    knowledgeGraphEn: collection({
      label: "Knowledge Graph (English)",
      slugField: "title",
      path: "packages/blog-shell/content/knowledge-graph/en/*",
      format: {
        contentField: "content",
      },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "Title" },
        }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Technical", value: "technical" },
            { label: "Issue", value: "issue" },
            { label: "Slang", value: "slang" },
          ],
          defaultValue: "technical",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        relationships: fields.array(
          fields.object({
            id: fields.text({ label: "Node ID" }),
            type: fields.text({ label: "Relationship Type" }),
          }),
          {
            label: "Relationships",
            itemLabel: (props) => `${props.fields.id.value} (${props.fields.type.value})`,
          }
        ),
        locale: fields.text({
          label: "Locale",
          defaultValue: "en",
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "packages/blog-shell/public/images/knowledge-graph",
              publicPath: "/images/knowledge-graph/",
            },
          },
        }),
      },
    }),

    knowledgeGraphVi: collection({
      label: "Knowledge Graph (Tiếng Việt)",
      slugField: "title",
      path: "packages/blog-shell/content/knowledge-graph/vi/*",
      format: {
        contentField: "content",
      },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "Title" },
        }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Technical", value: "technical" },
            { label: "Issue", value: "issue" },
            { label: "Slang", value: "slang" },
          ],
          defaultValue: "technical",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        relationships: fields.array(
          fields.object({
            id: fields.text({ label: "Node ID" }),
            type: fields.text({ label: "Relationship Type" }),
          }),
          {
            label: "Relationships",
            itemLabel: (props) => `${props.fields.id.value} (${props.fields.type.value})`,
          }
        ),
        locale: fields.text({
          label: "Locale",
          defaultValue: "vi",
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "packages/blog-shell/public/images/knowledge-graph",
              publicPath: "/images/knowledge-graph/",
            },
          },
        }),
      },
    }),
  },
});
