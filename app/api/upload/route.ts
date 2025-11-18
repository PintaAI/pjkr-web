import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { uploadOptions } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData as any).get('file') as File;
    const uploadType = ((formData as any).get('type') as string) || 'image';
    const customFolder = (formData as any).get('folder') as string | null;
    const customPublicId = (formData as any).get('public_id') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get upload options based on type
    const baseOptions = uploadOptions[uploadType as keyof typeof uploadOptions] || uploadOptions.image;

    // Set public_id if provided, else default
    let publicId = customPublicId || `${uploadType}_${Date.now()}`;
    
    // Add extension for PDFs
    if (file.type === 'application/pdf') {
      publicId = publicId + '.pdf';
    }

    // Build options with overrides
    const options: any = {
      ...baseOptions,
      public_id: publicId,
      ...(customFolder ? { folder: `pjkr/${customFolder}` } : {}),
    };
    
    // Special handling for PDF files
    if (file.type === 'application/pdf') {
      // Override folder for PDFs to ensure proper organization
      options.folder = 'pjkr/kelas-materials';
      // Ensure it's uploaded as raw (for binary files like PDF)
      options.resource_type = 'raw';
      // Make it publicly accessible
      options.access_mode = 'public';
      options.type = 'upload';
    }

    // Upload to Cloudinary using stream for buffer
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const max_results = parseInt(searchParams.get('max_results') || '10', 10);
    const next_cursor = searchParams.get('next_cursor') || undefined;
    const resource_type = searchParams.get('resource_type') || 'auto';
    const folder = searchParams.get('folder') || '';

    const prefix = folder ? `pjkr/${folder}/` : 'pjkr/';

    // Get subfolders under 'pjkr/'
    const foldersResult = await cloudinary.api.sub_folders('pjkr');
    const folders = foldersResult.folders.map((f: any) => ({
      name: f.name,
      path: f.path,
    }));

    // Get resources
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
      success: true,
      data: {
        folders,
        resources,
        next_cursor: resourcesResult.next_cursor,
        has_more: !!resourcesResult.next_cursor,
      },
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to list resources' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { publicId, resource_type } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'No public ID provided' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary with resource_type support
    const deleteOptions: any = {};
    if (resource_type) {
      deleteOptions.resource_type = resource_type;
    }
    
    const result = await cloudinary.uploader.destroy(publicId, deleteOptions);
    
    return NextResponse.json({
      success: true,
      data: {
        result: result.result,
      },
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}
