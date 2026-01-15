'use client';

import { useState, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const ASSISTANT_ID = 'd476d365-e717-4007-be37-7a4e2db3f36b';

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending';

export default function VoiceAgent() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) return;

    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);

    vapiInstance.on('call-start', () => {
      setStatus('active');
      setTranscript([]);
    });

    vapiInstance.on('call-end', () => {
      setStatus('idle');
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript(prev => [...prev, `${message.role}: ${message.transcript}`]);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('VAPI Error:', error);
      setStatus('idle');
    });

    setVapi(vapiInstance);

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!vapi || status !== 'idle') return;

    setStatus('connecting');
    try {
      await vapi.start(ASSISTANT_ID);
    } catch (error) {
      console.error('Failed to start call:', error);
      setStatus('idle');
    }
  }, [vapi, status]);

  const endCall = useCallback(() => {
    if (!vapi || status === 'idle') return;

    setStatus('ending');
    vapi.stop();
  }, [vapi, status]);

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connexion...';
      case 'active': return isSpeaking ? 'Sophie parle...' : 'En appel';
      case 'ending': return 'Fin d\'appel...';
      default: return 'Prêt';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'connecting': return 'Connexion...';
      case 'active': return 'Terminer l\'appel';
      case 'ending': return 'Fin...';
      default: return 'Parler avec Sophie';
    }
  };

  if (!VAPI_PUBLIC_KEY) {
    return (
      <div className="text-center p-8">
        <p className="text-zinc-500">Configuration en cours...</p>
        <p className="text-sm text-zinc-400 mt-2">VAPI_PUBLIC_KEY non configuré</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
          status === 'active'
            ? isSpeaking
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-green-400'
            : status === 'connecting' || status === 'ending'
              ? 'bg-yellow-400 animate-pulse'
              : 'bg-zinc-300'
        }`} />
        <span className="text-sm text-zinc-500 font-medium">{getStatusText()}</span>
      </div>

      {/* Call button */}
      <button
        onClick={status === 'active' ? endCall : startCall}
        disabled={status === 'connecting' || status === 'ending'}
        className={`
          relative w-32 h-32 rounded-full transition-all duration-300 ease-out
          flex items-center justify-center
          ${status === 'active'
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
            : status === 'connecting' || status === 'ending'
              ? 'bg-zinc-300 cursor-not-allowed'
              : 'bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {status === 'active' ? (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )}

        {/* Ripple effect for active call */}
        {status === 'active' && isSpeaking && (
          <>
            <span className="absolute w-full h-full rounded-full bg-cyan-400/30 animate-ping" />
            <span className="absolute w-[120%] h-[120%] rounded-full bg-cyan-400/20 animate-pulse" />
          </>
        )}
      </button>

      <p className="text-lg font-medium text-zinc-700">
        {getButtonText()}
      </p>

      {/* Transcript preview */}
      {transcript.length > 0 && (
        <div className="w-full max-w-md mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Transcription</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {transcript.slice(-5).map((line, i) => (
              <p key={i} className="text-sm text-zinc-600">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
