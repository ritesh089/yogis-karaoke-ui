"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateKaraoke = async () => {
    setIsLoading(true);
    setError('');
    setDownloadUrl(null);

    try {
      const response = await axios.get('/api/karaoke', {
        params: { url: youtubeUrl },
        responseType: 'blob', // To handle the audio file
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      setError('Failed to generate karaoke. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">YouTube Karaoke Generator</h1>

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow p-6">
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
          disabled={!youtubeUrl || isLoading}
          className={`w-full py-3 rounded-lg text-white font-bold ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Processing...' : 'Generate Karaoke'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {downloadUrl && (
          <div className="mt-6">
            <a
              href={downloadUrl}
              download="karaoke.mp3"
              className="inline-block w-full text-center bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
            >
              Download Karaoke
            </a>
          </div>
        )}
      </div>
    </div>
  );
}