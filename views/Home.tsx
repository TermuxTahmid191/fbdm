
import React from 'react';
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Share2, 
  Facebook, 
  Info, 
  Phone,
  CreditCard,
  Award,
  BarChart3,
  Sparkles,
  Trophy,
  HelpCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Heart
} from 'lucide-react';
import { Notice, DonationEvent, ScheduledDonation, AppSettings } from '../types';
import { initialAppSettings } from '../store';

interface HomeProps {
  notices: Notice[];
  events: DonationEvent[];
  onNavigate: (tab: string) => void;
  onOpenCertificate?: () => void;
  onOpenMembershipCard?: () => void;
  onOpenAnalysis?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenScheduleModal?: () => void;
  onOpenFAQ?: () => void;
  upcomingDonations?: ScheduledDonation[];
  onCompleteScheduledDonation?: (id: string) => void;
  appSettings?: AppSettings;
}

const HomeView: React.FC<HomeProps> = ({ 
  notices, 
  events, 
  onNavigate,
  onOpenCertificate,
  onOpenMembershipCard,
  onOpenAnalysis,
  onOpenLeaderboard,
  onOpenScheduleModal,
  onOpenFAQ,
  upcomingDonations = [],
  onCompleteScheduledDonation,
  appSettings = initialAppSettings
}) => {
  // Helper to calculate days remaining
  const getDaysRemaining = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Live Admin Broadcast Banner */}
      {appSettings.showBannerNotice && appSettings.activeBannerNotice && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell size={15} className="text-white animate-bounce" />
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wider text-[10px] bg-white/20 px-2 py-0.5 rounded mr-1.5">
                নোটিশ
              </span>
              <span className="font-semibold">{appSettings.activeBannerNotice}</span>
            </div>
          </div>
          {appSettings.emergencyHotline && (
            <a 
              href={`tel:${appSettings.emergencyHotline.replace(/\D/g, '')}`}
              className="hidden sm:flex items-center gap-1.5 bg-white text-red-600 px-3 py-1.5 rounded-xl text-xs font-black hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
            >
              <Phone size={13} />
              <span>{appSettings.emergencyHotline}</span>
            </a>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-red-100 mb-3 border border-white/20">
            <Sparkles size={13} className="text-amber-300" />
            <span>{appSettings.orgName || 'Friends Blood Donation Mymensingh (FBDM)'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            {appSettings.heroTitle || appSettings.tagline || 'Be a Hero, Save Lives.'}
          </h2>
          <p className="text-red-100 mb-6 text-xs sm:text-sm opacity-90 max-w-xl">
            {appSettings.heroSubtitle || 'স্বেচ্ছায় রক্তদান করুন, জীবন বাঁচান। ময়মনসিংহ জেলার যেকোনো জরুরি রক্তের প্রয়োজনে আমরা আছি আপনার পাশে।'}
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button 
              onClick={() => onNavigate('request')}
              className="bg-white text-red-600 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>Request Blood</span>
            </button>
            <button 
              onClick={() => onNavigate('search')}
              className="bg-red-500/40 text-white border border-white/30 py-3 rounded-2xl font-black text-xs sm:text-sm backdrop-blur-md hover:bg-red-500/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Heart size={16} />
              <span>Find Donors</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Services & Donor Tools */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={onOpenMembershipCard}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all text-left flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors mb-2">
            <CreditCard size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 group-hover:text-red-600 transition-colors">
              Membership Card
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Digital ID with QR</p>
          </div>
        </button>

        <button
          onClick={onOpenCertificate}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all text-left flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors mb-2">
            <Award size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 group-hover:text-amber-700 transition-colors">
              Certificate
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Appreciation PDF</p>
          </div>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-200 transition-all text-left flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors mb-2">
            <Trophy size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 group-hover:text-purple-700 transition-colors">
              Top Donors
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Hall of Fame</p>
          </div>
        </button>

        <button
          onClick={onOpenAnalysis}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2">
            <BarChart3 size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
              Analysis
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Impact & analytics</p>
          </div>
        </button>

        <button
          onClick={onOpenFAQ || (() => onNavigate('faq'))}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all text-left flex flex-col justify-between group col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-2">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors">
              Donor FAQ
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Mymensingh guide</p>
          </div>
        </button>
      </section>

      {/* Upcoming Donations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar size={18} className="text-red-500" />
              <span>Upcoming Donations</span>
            </h3>
            <p className="text-xs text-slate-500">Scheduled blood donation goals & pledges</p>
          </div>

          <button
            onClick={onOpenScheduleModal}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>Schedule Donation</span>
          </button>
        </div>

        {upcomingDonations.length === 0 ? (
          <div className="p-6 bg-gradient-to-br from-red-50/60 to-rose-50/30 rounded-3xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-xs flex-shrink-0 border border-red-100">
                <Heart size={24} className="fill-red-500 text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Plan your next life-saving blood donation</h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                  Whole blood can be donated every 90 days. Set your target date to receive reminders and save lives at MMCH or local hospitals.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenScheduleModal}
              className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold shadow-2xs transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              📅 Set Next Donation Date
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {upcomingDonations.map((item) => {
              const daysLeft = getDaysRemaining(item.targetDate);
              const isToday = daysLeft === 0;
              const isPast = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md">
                        {item.userBloodGroup}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : isPast
                          ? 'bg-slate-100 text-slate-600'
                          : daysLeft <= 3
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {isToday ? 'Today! 🩸' : isPast ? 'Due' : `In ${daysLeft} days`}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.userName}</h4>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <Calendar size={13} className="text-red-500 flex-shrink-0" />
                      <span className="font-semibold">
                        {new Date(item.targetDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-start gap-1.5 mt-1">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.hospitalOrCenter}</span>
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" /> Goal Pledged
                    </span>
                    {onCompleteScheduledDonation && (
                      <button
                        onClick={() => onCompleteScheduledDonation(item.id)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        <a 
          href={appSettings.facebookGroupUrl || 'https://facebook.com'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-4 hover:opacity-95 transition-opacity"
        >
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-200">
            <Facebook size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900">Official Community</h4>
            <p className="text-xs text-blue-700">Join our Facebook group & community to stay updated on emergency requests.</p>
          </div>
          <ChevronRight className="text-blue-400" />
        </a>
      </section>

      {/* Quick Contacts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Emergency Contacts</h3>
            <p className="text-xs text-slate-500">24/7 hotline and medical hospital blood banks</p>
          </div>
          {appSettings.emergencyHotline && (
            <a 
              href={`tel:${appSettings.emergencyHotline.replace(/\D/g, '')}`}
              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-700 transition-colors shadow-xs"
            >
              <Phone size={13} />
              <span>Call Hotline</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {appSettings.emergencyContacts && appSettings.emergencyContacts.length > 0 ? (
            appSettings.emergencyContacts.map(contact => (
              <ContactCard key={contact.id} name={contact.name} phone={contact.phone} note={contact.note} />
            ))
          ) : (
            <>
              <ContactCard name="MMCH Blood Bank" phone="091-66666" note="24/7 Service" />
              <ContactCard name="Police Control Room" phone="091-100" note="Mymensingh" />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const ContactCard: React.FC<{ name: string, phone: string, note?: string }> = ({ name, phone, note }) => (
  <a 
    href={`tel:${phone.replace(/\D/g, '')}`}
    className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 flex items-center space-x-3 hover:border-red-200 transition-all group"
  >
    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
      <Phone size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-red-600 transition-colors">{name}</p>
      <p className="text-xs text-slate-500 font-mono font-medium">{phone}</p>
      {note && <p className="text-[10px] text-slate-400 truncate">{note}</p>}
    </div>
  </a>
);

export default HomeView;
