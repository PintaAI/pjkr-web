import { NextResponse } from 'next/server';
import { getExploreData } from '@/app/actions/explore';

export async function GET() {
  const result = await getExploreData();

  if (result.success) {
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }
}