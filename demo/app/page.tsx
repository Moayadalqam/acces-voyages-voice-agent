import Image from 'next/image';
import VoiceAgent from './components/VoiceAgent';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png?format=1500w"
            alt="Qualia Solutions"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center mb-12 max-w-lg">
          <h1 className="text-3xl font-light text-zinc-900 mb-3 tracking-tight">
            Sophie
          </h1>
          <p className="text-zinc-500 text-lg">
            Conseillère voyage virtuelle bilingue
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Accès Croisières et Voyages
          </p>
        </div>

        {/* Voice Agent */}
        <VoiceAgent />

        {/* Instructions */}
        <div className="mt-12 text-center max-w-md">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Cliquez le bouton pour démarrer une conversation avec Sophie.
            Elle peut répondre en français ou en anglais.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto">
          {/* Demo disclaimer */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-amber-700 text-center">
              <span className="font-medium">Demo Only</span> — This is a demonstration environment for testing purposes only.
              Not for production use. No real bookings or transactions will be processed.
            </p>
          </div>

          {/* Powered by */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-zinc-400 uppercase tracking-widest">
              Powered by
            </p>
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png?format=1500w"
                alt="Qualia Solutions"
                width={120}
                height={40}
                className="object-contain"
              />
            </a>
            <p className="text-xs text-zinc-400">
              AI Agents & Automation
            </p>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-zinc-300 mt-6">
            © {new Date().getFullYear()} Qualia Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
