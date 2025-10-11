import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession, hasRole } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !(await hasRole('ADMIN'))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const max_results = parseInt(searchParams.get('max_results') || '20', 10);

    const usage = await cloudinary.api.usage();

    // Fetch ALL resources to count by type and calculate actual storage usage
    const resourceCounts = { image: 0, video: 0, raw: 0 };
    let calculatedStorageUsage = 0;
    const resourceTypes = ['image', 'video', 'raw'];

    for (const type of resourceTypes) {
      try {
        const allTypeResources: any[] = [];
        let cursor: string | undefined = undefined;
        
        // Fetch ALL resources of this type (handle pagination)
        do {
          const resourcesResult = await cloudinary.api.resources({
            max_results: 500,
            resource_type: type as 'image' | 'video' | 'raw',
            direction: 'asc',
            next_cursor: cursor,
          });
          
          allTypeResources.push(...resourcesResult.resources);
          cursor = resourcesResult.next_cursor;
        } while (cursor);
        
        resourceCounts[type as keyof typeof resourceCounts] = allTypeResources.length;
        
        // Calculate storage usage for this type
        const typeStorage = allTypeResources.reduce((total, resource) => total + (resource.bytes || 0), 0);
        calculatedStorageUsage += typeStorage;
        
        
      } catch (resError) {
        console.error(`Resources count error for ${type}:`, resError);
      }
    }

    // Fetch paginated resources for table - combine all resource types
    let resources: any[] = [];
    const result_next_cursor = undefined;
    let has_more = false;
    
    try {
      // Fetch resources from each type separately and combine
      const allResources: any[] = [];
      
      for (const type of resourceTypes) {
        try {
          const resourcesParams: any = {
            resource_type: type as 'image' | 'video' | 'raw',
            max_results: Math.ceil(max_results / resourceTypes.length), // Distribute across types
            direction: 'asc',
            sort_by: ['created_at', 'asc'],
          };

          const resourcesResult = await cloudinary.api.resources(resourcesParams);
          const mappedResources = resourcesResult.resources.map((r: any) => ({
            public_id: r.public_id,
            resource_type: r.resource_type,
            bytes: r.bytes,
            secure_url: r.secure_url,
            created_at: r.created_at,
          }));
          
          allResources.push(...mappedResources);
        } catch (typeError) {
          console.error(`Error fetching ${type} resources:`, typeError);
        }
      }
      
      // Sort combined results by creation date and limit
      resources = allResources
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, max_results);
        
      // For simplicity, we'll not handle cursor pagination across multiple resource types
      // This would require more complex logic to maintain cursor state per type
      has_more = allResources.length > max_results;
      
    } catch (resError) {
      console.error('Combined resources error:', resError);
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          usage: {
            storage: calculatedStorageUsage,
            images: resourceCounts.image,
            videos: resourceCounts.video,
            raw: resourceCounts.raw,
            transforms: usage.transformations?.usage || 0,
          },
        },
        resources,
        next_cursor: result_next_cursor,
        has_more,
      },
    });

  } catch (error) {
    console.error('Storage usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch storage data' },
      { status: 500 }
    );
  }
}