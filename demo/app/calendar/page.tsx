'use client';

import { useEffect, useState } from 'react';
import { supabase, Appointment } from '@/app/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-teal-100 text-teal-800 border-teal-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  no_show: 'bg-red-100 text-red-800 border-red-200'
};

const typeLabels: Record<string, string> = {
  consultation: 'Consultation',
  follow_up: 'Suivi',
  booking: 'Réservation',
  other: 'Autre'
};

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.appointment_date === dateStr);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && a.status !== 'cancelled';
  });

  const todayAppointments = getAppointmentsForDate(new Date());

  return (
    <div className="min-h-screen bg-slate-50">
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
              <Link href="/" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Demo
              </Link>
              <Link href="/leads" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Leads
              </Link>
              <Link href="/calendar" className="px-4 py-2 text-sm bg-teal-50 text-teal-700 font-medium rounded-lg">
                Calendrier
              </Link>
            </nav>
          </div>
          <p className="text-xs text-slate-400">Accès Croisières et Voyages</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-slate-800">{todayAppointments.length}</p>
            <p className="text-sm text-slate-500">Aujourd&apos;hui</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-teal-600">{upcomingAppointments.length}</p>
            <p className="text-sm text-slate-500">À venir</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-green-600">
              {appointments.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-500">Complétés</p>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h1>
            <div className="flex gap-1">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Liste
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Chargement...
          </div>
        ) : viewMode === 'week' ? (
          /* Week View */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekDates.map((date, i) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const dayAppointments = getAppointmentsForDate(date);

                return (
                  <div
                    key={i}
                    className={`p-4 text-center border-r last:border-r-0 border-slate-100 ${
                      isToday ? 'bg-teal-50' : ''
                    }`}
                  >
                    <p className="text-xs text-slate-400 uppercase">{dayNames[i]}</p>
                    <p className={`text-lg font-semibold mt-1 ${
                      isToday ? 'text-teal-700' : 'text-slate-800'
                    }`}>
                      {date.getDate()}
                    </p>
                    {dayAppointments.length > 0 && (
                      <div className="mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDates.map((date, i) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={i}
                    className={`p-2 border-r last:border-r-0 border-slate-100 ${
                      isToday ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`mb-2 p-2 rounded-lg border text-xs ${statusColors[apt.status]}`}
                      >
                        <p className="font-semibold">{apt.appointment_time.slice(0, 5)}</p>
                        <p className="truncate">{apt.client_name}</p>
                        <p className="text-[10px] opacity-75">{typeLabels[apt.appointment_type]}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-6 py-3">
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                Rendez-vous à venir ({upcomingAppointments.length})
              </h2>
            </div>
            {upcomingAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                Aucun rendez-vous planifié. Les rendez-vous apparaîtront ici.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800">{apt.client_name}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[apt.status]}`}>
                            {apt.status}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                            {typeLabels[apt.appointment_type]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs">Date</p>
                            <p className="text-slate-700 font-medium">
                              {new Date(apt.appointment_date).toLocaleDateString('fr-CA', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Heure</p>
                            <p className="text-slate-700 font-medium">{apt.appointment_time.slice(0, 5)}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Téléphone</p>
                            <p className="text-slate-700">{apt.phone_number}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Durée</p>
                            <p className="text-slate-700">{apt.duration_minutes} min</p>
                          </div>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-slate-500 mt-2 italic">&quot;{apt.notes}&quot;</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <select
                          value={apt.status}
                          onChange={(e) => updateStatus(apt.id, e.target.value)}
                          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="scheduled">Planifié</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="completed">Complété</option>
                          <option value="cancelled">Annulé</option>
                          <option value="no_show">No-show</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
