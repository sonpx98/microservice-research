import { config, fields, collection } from '@keystatic/core';

// keystatic.config.tsx
export default config({
  storage: 
 {
          kind: 'github',
          repo: {
            owner: 'sonpx98',
            name: 'microservice-research'
          }
        },

  
  collections: {
    postsEn: collection({
      label: 'Blog Posts (English)',
      slugField: 'slug',
      path: 'packages/keystatic-admin/content/posts/en/*',
      format: { 
        contentField: 'content'
      },
      entryLayout: 'content',
      schema: {
        slug: fields.slug({ 
          name: { label: 'Slug' }
        }),
        title: fields.text({ 
          label: 'Title',
          validation: { isRequired: true }
        }),
        date: fields.date({ 
          label: 'Published Date',
          defaultValue: { kind: 'today' }
        }),
        excerpt: fields.text({ 
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true }
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: props => props.value
          }
        ),
        published: fields.checkbox({ 
          label: 'Published',
          defaultValue: false
        }),
        locale: fields.text({
          label: 'Locale',
          defaultValue: 'en',
          validation: { isRequired: true }
        }),
        content: fields.markdoc({  // Must match contentField name
          label: 'Content',
          extension: 'md',  // Use .md extension
          options: {
            image: {
              directory: 'packages/blog-shell/public/images/posts',
              publicPath: '/images/posts/'
            }
          }
        })
      }
    }),
    
    postsVi: collection({
      label: 'Blog Posts (Tiếng Việt)',
      slugField: 'slug',
      path: 'packages/keystatic-admin/content/posts/vi/*',
      format: { 
        contentField: 'content'
      },
      entryLayout: 'content',
      schema: {
        slug: fields.slug({ 
          name: { label: 'Slug' }
        }),
        title: fields.text({ 
          label: 'Title',
          validation: { isRequired: true }
        }),
        date: fields.date({ 
          label: 'Published Date',
          defaultValue: { kind: 'today' }
        }),
        excerpt: fields.text({ 
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true }
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: props => props.value
          }
        ),
        published: fields.checkbox({ 
          label: 'Published',
          defaultValue: false
        }),
        locale: fields.text({
          label: 'Locale',
          defaultValue: 'vi',
          validation: { isRequired: true }
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: {
            image: {
              directory: 'packages/blog-shell/public/images/posts',
              publicPath: '/images/posts/'
            }
          }
        })
      }
    })
  }
});
