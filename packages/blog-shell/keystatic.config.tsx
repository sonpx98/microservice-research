import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: 
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: {
            owner: 'sonpx98',                // Your GitHub username
            name: 'microservice-research'    // Private repo - OK!
          }
        }
      : { kind: 'local' },
  collections: {
    postsEn: collection({
      label: 'Blog Posts (English)',
      slugField: 'title',
      path: 'content/posts/en/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ 
          name: { 
            label: 'Title',
            validation: { isRequired: true }
          } 
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
          defaultValue: 'en'
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md'
        })
      }
    }),
    postsVi: collection({
      label: 'Blog Posts (Tiếng Việt)',
      slugField: 'title',
      path: 'content/posts/vi/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ 
          name: { 
            label: 'Title',
            validation: { isRequired: true }
          } 
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
          defaultValue: 'vi'
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md'
        })
      }
    })
  }
});
