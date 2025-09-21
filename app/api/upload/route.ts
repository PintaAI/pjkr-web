import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { uploadOptions } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string || 'image';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get upload options based on type
    const options = uploadOptions[uploadType as keyof typeof uploadOptions] || uploadOptions.image;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          ...options,
          public_id: `${uploadType}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      format: (result as any).format,
      width: (result as any).width,
      height: (result as any).height,
      bytes: (result as any).bytes,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const max_results = parseInt(searchParams.get('max_results') || '10', 10);
    const next_cursor = searchParams.get('next_cursor') || undefined;
    const resource_type = searchParams.get('resource_type') || 'auto'; // image, video, raw, auto
    const folder = searchParams.get('folder') || ''; // e.g., 'images' -> prefix 'pjkr/images/'
    
    const prefix = folder ? `pjkr/${folder}/` : 'pjkr/';
    
    // Get subfolders under 'pjkr/'
    const foldersResult = await cloudinary.api.sub_folders('pjkr');
    const folders = foldersResult.folders.map((f: any) => ({
      name: f.name,
      path: f.path,
    }));

    // Get resources (files)
    const resourcesParams: any = {
      prefix,
      resource_type,
      max_results,
      next_cursor,
      direction: 'asc',
      sort_by: ['created_at', 'asc'],
    };

    const resourcesResult = await cloudinary.api.resources(resourcesParams);
    const resources = resourcesResult.resources.map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      resource_type: r.resource_type,
      created_at: r.created_at,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      format: r.format,
    }));

    return NextResponse.json({
      folders,
      resources,
      next_cursor: resourcesResult.next_cursor,
      has_more: !!resourcesResult.next_cursor,
    });

  } catch (error) {
    console.error('List resources error:', error);
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json({
      success: true,
      result: result.result,
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
