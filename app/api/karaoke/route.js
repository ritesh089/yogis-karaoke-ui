import axios from 'axios';
import { NextResponse } from 'next/server';


export async function GET(request) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/karaoke`, {
      params: { url },
      responseType: 'stream', // Return the audio file as a stream
    });

    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Disposition', 'inline; filename="karaoke.mp3"');

    return new Response(response.data, { headers });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process the request.' }, { status: 500 });
  }
}
