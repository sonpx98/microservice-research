export default function HomePage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasGitHubConfig = !!(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID && 
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && 
    process.env.KEYSTATIC_SECRET
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Keystatic Admin</h1>
      <p>
        Go to <a href="/keystatic" style={{ color: 'blue' }}>Keystatic CMS</a> to edit posts.
      </p>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Connection Status:</h3>
        <ul>
          <li>Environment: {isProduction ? '🟢 Production' : '🟡 Development'}</li>
          <li>Storage: {isProduction ? '📁 GitHub' : '💾 Local'}</li>
          <li>GitHub Config: {hasGitHubConfig ? '✅ Configured' : '❌ Missing'}</li>
        </ul>
        
        {isProduction && hasGitHubConfig && (
          <p style={{ color: 'green' }}>✅ Ready for GitHub authentication!</p>
        )}
        
        {isProduction && !hasGitHubConfig && (
          <p style={{ color: 'red' }}>❌ Missing GitHub environment variables!</p>
        )}
      </div>
    </div>
  );
}
