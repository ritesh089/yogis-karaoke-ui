"use client";

import { useState, useRef } from 'react';
import axios from 'axios';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isKaraokeReady, setIsKaraokeReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef(null);

  const handleGenerateKaraoke = async () => {
    setIsLoading(true);
    setError('');
    setIsKaraokeReady(false);
    handleStopAudio();

    try {
      await axios.get('/api/karaoke', {
        params: { url: youtubeUrl },
        responseType: 'json',
      });
      setIsKaraokeReady(true);
    } catch (err) {
      setError('Failed to generate karaoke. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsBuffering(true);

    try {
      const response = await axios.get(`/api/karaoke?url=${encodeURIComponent(youtubeUrl)}&type=karaoke`, {
        responseType: 'blob',
      });
      const audioUrl = window.URL.createObjectURL(new Blob([response.data]));
      audioRef.current.src = audioUrl;
      setIsPlaying(true);
      setIsBuffering(false);
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err);
        setError('Failed to play the audio.');
        setIsPlaying(false);
      });
      audioRef.current.onended = () => setIsPlaying(false);
    } catch (err) {
      setError('Failed to play the audio.');
      setIsPlaying(false);
      setIsBuffering(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-8">🎵 YouTube Karaoke Generator</h1>

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
          className="w-full p-3 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
        />

        <button
          onClick={handleGenerateKaraoke}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-bold ${
            isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Processing...' : isKaraokeReady ? 'Regenerate Karaoke' : 'Generate Karaoke'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {isKaraokeReady && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Your Karaoke is Ready:</h2>
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="relative flex flex-col items-center space-y-4">
                {isBuffering && <div className="loader w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className={`w-full py-3 rounded-lg text-white font-bold ${
                    isPlaying ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isPlaying ? 'Playing...' : 'Play Karaoke'}
                </button>
                <div className="w-full mt-4 p-4 bg-gray-800 rounded-lg">
                  <audio ref={audioRef} controls className="w-full appearance-none bg-gray-900 text-white rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
