import axios from 'axios';
import { NextResponse } from 'next/server';


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/karaoke`, {
      params: { url },
      responseType: 'stream', // Stream the file to the client
    });

    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="karaoke.mp3"');
    headers.append('Content-Type', 'audio/mpeg');

    return new Response(response.data, {
      headers,
    });
  } catch (err) {
    console.error('Error fetching karaoke:', err);
    return NextResponse.json({ error: 'Failed to process the request.' }, { status: 500 });
  }
}
