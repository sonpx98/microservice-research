import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { default: keystatic } = await import('../../../../keystatic.config');
    
    const collections = Object.keys(keystatic.collections || {});
    
    let collectionTests: Record<string, any> = {};
    
    for (const collectionName of collections) {
      try {
        const collection = (keystatic.collections as any)[collectionName];
        collectionTests[collectionName] = {
          path: collection.path,
          label: collection.label,
          test_status: 'configured'
        };
      } catch (error) {
        collectionTests[collectionName] = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      keystatic_config: {
        storage: keystatic.storage,
        collections_found: collections,
        collection_details: collectionTests
      },
      note: 'This tests the actual Keystatic configuration that would be used'
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load Keystatic config',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}