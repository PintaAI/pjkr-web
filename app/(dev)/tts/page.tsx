'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  text: string;
  voiceId: string;
}

export default function TTSTestPage() {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      text: '안녕하세요, 이것은 한국어 텍스트입니다.',
      voiceId: 'EXAVITQu4vr4xnSDxMaL' // Rachel (female)
    },
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.text, voiceId: data.voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">ElevenLabs TTS Test</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Add your ELEVENLABS_API_KEY to .env.local and restart the dev server.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium mb-1">
            Text to Speak
          </label>
          <textarea
            id="text"
            {...register('text', { required: true })}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter text to convert to speech..."
          />
        </div>
        <div>
          <label htmlFor="voiceId" className="block text-sm font-medium mb-1">
            Voice
          </label>
          <select
            id="voiceId"
            {...register('voiceId', { required: true })}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="JBFqnCBsd6RMkjVDRZzb">Adam (Male)</option>
            <option value="EXAVITQu4vr4xnSDxMaL">Rachel (Female)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Speech'}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-md text-red-700">
          Error: {error}
        </div>
      )}
      {audioUrl && (
        <div className="mt-4">
          <audio controls className="w-full" src={audioUrl} autoPlay>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}