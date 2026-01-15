'use client';

import { useEffect, useState } from 'react';
import { supabase, Lead } from '@/app/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  new: 'bg-teal-100 text-teal-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-slate-100 text-slate-600'
};

const tripTypeLabels: Record<string, string> = {
  cruise: 'Croisière',
  'all-inclusive': 'Tout-inclus',
  golf: 'Golf',
  wedding: 'Mariage',
  honeymoon: 'Lune de miel',
  group: 'Groupe',
  other: 'Autre'
};

const budgetLabels: Record<string, string> = {
  under_2000: '< $2,000',
  '2000_5000': '$2,000 - $5,000',
  '5000_10000': '$5,000 - $10,000',
  over_10000: '> $10,000'
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(l => l.status === filter);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png?format=1500w"
              alt="Qualia Solutions"
              width={80}
              height={27}
              className="object-contain sm:w-[100px]"
            />
            <nav className="flex gap-0.5 sm:gap-1">
              <Link href="/" className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Demo
              </Link>
              <Link href="/leads" className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-teal-50 text-teal-700 font-medium rounded-lg">
                Leads
              </Link>
              <Link href="/calendar" className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Calendrier
              </Link>
            </nav>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Accès Croisières et Voyages</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-semibold text-slate-800">{stats.total}</p>
            <p className="text-xs sm:text-sm text-slate-500">Total Leads</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-semibold text-teal-600">{stats.new}</p>
            <p className="text-xs sm:text-sm text-slate-500">Nouveaux</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-semibold text-blue-600">{stats.contacted}</p>
            <p className="text-xs sm:text-sm text-slate-500">Contactés</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-semibold text-green-600">{stats.converted}</p>
            <p className="text-xs sm:text-sm text-slate-500">Convertis</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {['all', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Tous' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-4 sm:px-6 py-3">
            <h2 className="text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
              Leads Capturés ({filteredLeads.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center text-slate-400">Chargement...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 text-sm">
              Aucun lead pour le moment. Les leads apparaîtront ici après les appels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{lead.caller_name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                        {lead.language && (
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                            {lead.language === 'french' ? 'FR' : 'EN'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">Téléphone</p>
                          <p className="text-slate-700 text-xs sm:text-sm">{lead.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Destination</p>
                          <p className="text-slate-700 text-xs sm:text-sm">{lead.destination}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Type</p>
                          <p className="text-slate-700 text-xs sm:text-sm">{tripTypeLabels[lead.trip_type] || lead.trip_type}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Budget</p>
                          <p className="text-slate-700 text-xs sm:text-sm">{lead.budget_range ? budgetLabels[lead.budget_range] : '-'}</p>
                        </div>
                      </div>
                      {lead.travel_dates && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-2">Dates: {lead.travel_dates}</p>
                      )}
                      {lead.notes && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 italic">&quot;{lead.notes}&quot;</p>
                      )}
                      <p className="text-xs text-slate-400 mt-3">
                        {new Date(lead.created_at).toLocaleString('fr-CA')}
                        {lead.callback_time && ` • Rappeler: ${lead.callback_time}`}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:ml-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto"
                      >
                        <option value="new">Nouveau</option>
                        <option value="contacted">Contacté</option>
                        <option value="qualified">Qualifié</option>
                        <option value="converted">Converti</option>
                        <option value="lost">Perdu</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
