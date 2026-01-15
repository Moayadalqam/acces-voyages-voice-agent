import Image from 'next/image';
import Link from 'next/link';
import VoiceAgent from './components/VoiceAgent';

export default function Home() {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png?format=1500w"
              alt="Qualia Solutions"
              width={100}
              height={33}
              className="object-contain"
            />
            <nav className="flex gap-1">
              <Link href="/" className="px-4 py-2 text-sm bg-teal-50 text-teal-700 font-medium rounded-lg">
                Demo
              </Link>
              <Link href="/leads" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Leads
              </Link>
              <Link href="/calendar" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Calendrier
              </Link>
            </nav>
          </div>
          <p className="text-xs text-slate-400">Acces Croisieres et Voyages</p>
        </div>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-8">

        {/* Title - simplified, no Sophie name */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-slate-600 text-base md:text-lg font-medium">
            Conseillère voyage virtuelle
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Accès Croisières et Voyages
          </p>
        </div>

        {/* Voice Agent */}
        <VoiceAgent />
      </main>

      {/* Footer - compact */}
      <footer className="py-4 px-4 border-t border-slate-100">
        <div className="max-w-lg mx-auto">
          {/* Demo disclaimer - compact */}
          <div className="bg-amber-50/80 border border-amber-200/50 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] md:text-xs text-amber-700 text-center leading-relaxed">
              <span className="font-semibold">Demo Only</span> — For testing purposes only. No real bookings processed.
            </p>
          </div>

          {/* Powered by - compact */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Powered by
            </p>
            <a
              href="https://qualiasolutions.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png?format=1500w"
                alt="Qualia Solutions"
                width={80}
                height={26}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
