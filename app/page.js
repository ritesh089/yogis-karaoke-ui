"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { GoogleAnalytics, event } from 'nextjs-google-analytics';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isKaraokeReady, setIsKaraokeReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);

  const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE'; // Replace with your API key

  useEffect(() => {
    // Track page view on load
    event('page_view', {
      category: 'Navigation',
      label: 'Home Page',
    });
  }, []);

  const handleSearchYouTube = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`
      );
      setSearchResults(response.data.items);
    } catch (err) {
      console.error('YouTube search failed:', err);
    }
  };

  const handleSelectVideo = (videoId) => {
    setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`);
    setSearchResults([]); // Clear the search results after selection
  };

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center justify-center">
      <GoogleAnalytics trackPageViews />
      <h1 className="text-4xl font-extrabold mb-8 text-gray-100">🎵 YouTube Karaoke Generator</h1>

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <label htmlFor="searchQuery" className="block text-lg font-medium text-gray-300 mb-2">
          Search YouTube:
        </label>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter song name"
            className="flex-1 p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none"
          />
          <button
            onClick={handleSearchYouTube}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-bold"
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Select a Video:</h3>
            <ul className="space-y-2">
              {searchResults.map((video) => (
                <li key={video.id.videoId}>
                  <button
                    onClick={() => handleSelectVideo(video.id.videoId)}
                    className="block text-left w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-100"
                  >
                    <img
                      src={video.snippet.thumbnails.default.url}
                      alt={video.snippet.title}
                      className="inline-block w-16 h-9 mr-2"
                    />
                    {video.snippet.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <label htmlFor="youtubeUrl" className="block text-lg font-medium text-gray-300 mb-2">
          Selected YouTube URL:
        </label>
        <input
          type="text"
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=G7KNmW9a75Y"
          className="w-full p-3 border border-gray-700 rounded-lg mb-4 bg-gray-800 text-gray-100 focus:outline-none"
        />

        <button
          onClick={handleGenerateKaraoke}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-bold ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
        >
          {isLoading ? 'Processing...' : isKaraokeReady ? 'Regenerate Karaoke' : 'Generate Karaoke'}
        </button>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
