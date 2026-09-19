
import React from 'react';
/* Added Phone to imports */
import { Bell, Calendar, ChevronRight, Share2, Facebook, Info, Phone } from 'lucide-react';
import { Notice, DonationEvent } from '../types';

interface HomeProps {
  notices: Notice[];
  events: DonationEvent[];
  onNavigate: (tab: string) => void;
}

const HomeView: React.FC<HomeProps> = ({ notices, events, onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Be a Hero, Save Lives.</h2>
        <p className="text-red-100 mb-6 opacity-90">Every drop counts. Join Mymensingh's largest blood donation community.</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('request')}
            className="bg-white text-red-600 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-red-50 transition-colors"
          >
            Request Blood
          </button>
          <button 
            onClick={() => onNavigate('search')}
            className="bg-red-500/30 text-white border border-red-400/50 py-3 rounded-xl font-bold text-sm backdrop-blur-md hover:bg-red-500/40 transition-colors"
          >
            Find Donors
          </button>
        </div>
      </section>

      {/* Notice Board */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-red-500" />
            Notice Board
          </h3>
          <button className="text-xs text-red-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {notices.map(notice => (
            <div key={notice.id} className={`p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${notice.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-sm">{notice.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{notice.date}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{notice.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-red-500" />
            Upcoming Events
          </h3>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar -mx-4 px-4">
          {events.map(event => (
            <div key={event.id} className="min-w-[280px] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Live Event</span>
                  <button className="text-slate-400"><Share2 size={16} /></button>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{event.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                  <Calendar size={12} /> {event.date}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info size={12} /> {event.location}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-red-100 flex items-center justify-center text-[8px] font-bold text-red-600">+{event.interestedCount}</div>
                </div>
                <button className="bg-slate-900 text-white text-xs px-4 py-2 rounded-full font-bold hover:bg-slate-800 transition-colors">I'm Interested</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white">
            <Facebook size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900">Official Community</h4>
            <p className="text-xs text-blue-700">Join our Facebook group to stay updated on emergency requests.</p>
          </div>
          <ChevronRight className="text-blue-400" />
        </div>
      </section>

      {/* Quick Contacts */}
      <section>
        <h3 className="font-bold text-slate-800 mb-4 px-1">Emergency Contacts</h3>
        <div className="grid grid-cols-2 gap-4">
          <ContactCard name="MMCH Office" phone="091-66666" />
          <ContactCard name="Police Line" phone="091-100" />
        </div>
      </section>
    </div>
  );
};

const ContactCard: React.FC<{ name: string, phone: string }> = ({ name, phone }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
      <Phone size={18} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-800 leading-none mb-1">{name}</p>
      <p className="text-xs text-slate-500">{phone}</p>
    </div>
  </div>
);

export default HomeView;
