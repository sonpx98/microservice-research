#!/usr/bin/env node

/**
 * Script to trigger blog-shell deployment after keystatic-admin deployment
 * This is called as a post-build step
 */

const BLOG_DEPLOY_HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_BN6Et13cB4J9XxnGll6pWNMSWi1A/dCqRIiAQMi';

async function triggerBlogDeploy() {
  console.log('🚀 Triggering blog-shell deployment...');
  
  try {
    const response = await fetch(BLOG_DEPLOY_HOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Blog-shell deployment triggered successfully!');
      console.log('Job ID:', data.job?.id || 'N/A');
    } else {
      console.error('❌ Failed to trigger blog-shell deployment:', response.status, response.statusText);
      // Don't fail the build if the trigger fails
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error triggering blog-shell deployment:', error.message);
    // Don't fail the build if the trigger fails
    process.exit(0);
  }
}

triggerBlogDeploy();
