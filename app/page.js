"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { GoogleAnalytics, event } from 'nextjs-google-analytics';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isKaraokeReady, setIsKaraokeReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    // Track page view on load
    event('page_view', {
      category: 'Navigation',
      label: 'Home Page',
    });
  }, []);

  const handleGenerateKaraoke = async () => {
    setIsLoading(true);
    setError('');
    setIsKaraokeReady(false);

    try {
      await axios.get('/api/karaoke', {
        params: { url: youtubeUrl },
        responseType: 'json',
      });
      setIsKaraokeReady(true);
      event('generate_karaoke', {
        category: 'Action',
        label: 'Karaoke Generated',
        value: youtubeUrl,
      });
    } catch (err) {
      setError('Failed to generate karaoke. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    setIsBuffering(true);
    try {
      const response = await axios.get(`/api/karaoke?url=${encodeURIComponent(youtubeUrl)}&type=karaoke`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => setError('Failed to play the audio.'));
      event('play_audio', {
        category: 'Audio',
        label: 'Karaoke Playback',
      });
    } catch (err) {
      setError('Failed to play the audio.');
    } finally {
      setIsBuffering(false);
    }
  };

  const handleDownloadAudio = async () => {
    if (audioUrl) {
      try {
        const response = await axios.get(`/api/karaoke?url=${encodeURIComponent(youtubeUrl)}&type=karaoke`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'karaoke_audio.mp3';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError('Failed to download the audio.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center justify-center">
      <GoogleAnalytics trackPageViews />
      <h1 className="text-4xl font-extrabold mb-8 text-gray-100">🎵 StarryOke</h1>

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <label htmlFor="youtubeUrl" className="block text-lg font-medium text-gray-300 mb-2">
          Enter YouTube URL:
        </label>
        <input
          type="text"
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=G7KNmW9a75Y"
          className="w-full p-3 border border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-gray-100"
        />

        <button
          onClick={handleGenerateKaraoke}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-bold ${
            isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {isLoading ? 'Processing...' : isKaraokeReady ? 'Regenerate Karaoke' : 'Generate Karaoke'}
        </button>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        {isKaraokeReady && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">Your Karaoke is Ready:</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="relative flex flex-col items-center space-y-4">
                {isBuffering ? (
                  <div className="loader w-12 h-12 border-4 border-t-transparent border-gray-100 rounded-full animate-spin"></div>
                ) : (
                  <button
                    onClick={handlePlayAudio}
                    className="w-full py-3 rounded-lg text-gray-100 font-bold bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                  >
                    Play Karaoke
                  </button>
                )}
                <div className="w-full mt-4 p-4 bg-gray-900 rounded-lg">
                  <audio ref={audioRef} controls className="w-full appearance-none bg-gray-950 text-gray-100 rounded-lg" />
                  <button
                    onClick={handleDownloadAudio}
                    className="mt-4 py-2 px-4 rounded-lg bg-gray-700 text-gray-100 hover:bg-gray-600 font-bold w-full"
                  >
                    Download Audio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
