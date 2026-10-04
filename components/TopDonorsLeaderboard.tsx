import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  Heart, 
  Search, 
  X, 
  Flame, 
  ShieldCheck, 
  Droplet, 
  MapPin, 
  Sparkles,
  Pin,
  Edit3,
  CheckCircle2,
  Lock,
  Plus
} from 'lucide-react';
import { User, BloodGroup, AppSettings, UserRole } from '../types';
import { checkDonationEligibility, initialAppSettings } from '../store';

interface TopDonorsLeaderboardProps {
  donors: User[];
  onClose?: () => void;
  onSelectDonor?: (donor: User) => void;
  currentUser?: User | null;
  onUpdateDonor?: (donor: User) => void;
  appSettings?: AppSettings;
}

export const TopDonorsLeaderboard: React.FC<TopDonorsLeaderboardProps> = ({
  donors,
  onClose,
  onSelectDonor,
  currentUser,
  onUpdateDonor,
  appSettings = initialAppSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Admin In-Place Editing Modal
  const [editingDonor, setEditingDonor] = useState<User | null>(null);

  const canEditLeaderboard = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN);
  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Filter & sort donors: pinned first, then by donation count descending
  const sortedDonors = useMemo(() => {
    return [...donors]
      .sort((a, b) => {
        if (a.isPinnedOnLeaderboard && !b.isPinnedOnLeaderboard) return -1;
        if (!a.isPinnedOnLeaderboard && b.isPinnedOnLeaderboard) return 1;
        return (b.donationsCount || 0) - (a.donationsCount || 0);
      })
      .filter(donor => {
        const matchesGroup = selectedGroup === 'ALL' || donor.bloodGroup === selectedGroup;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          donor.name.toLowerCase().includes(query) || 
          donor.upazila?.toLowerCase().includes(query) ||
          donor.district?.toLowerCase().includes(query) ||
          donor.bloodGroup.toLowerCase().includes(query);
        return matchesGroup && matchesSearch;
      });
  }, [donors, selectedGroup, searchQuery]);

  // Community aggregate impact
  const totalDonations = useMemo(() => {
    return donors.reduce((sum, d) => sum + (d.donationsCount || 0), 0);
  }, [donors]);

  const estimatedLivesSaved = totalDonations * 3;

  const topThree = sortedDonors.slice(0, 3);

  const getTierBadge = (count: number, customTitle?: string) => {
    if (customTitle && customTitle.trim()) {
      return { name: customTitle, color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (count >= 15) return { name: 'Legendary Saver', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (count >= 10) return { name: 'Gold Champion', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (count >= 5) return { name: 'Silver Guardian', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    return { name: 'Active Hero', color: 'bg-red-50 text-red-700 border-red-200' };
  };

  const handleSaveLeaderboardDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonor) return;
    onUpdateDonor?.(editingDonor);
    setEditingDonor(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white relative flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <Trophy size={26} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1 border border-amber-300/30">
                  <Flame size={12} className="text-amber-300" />
                  {appSettings.leaderboardTitle || 'Top Blood Donors Leaderboard'}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Mymensingh & National Hall of Fame
                </h2>
                <p className="text-xs text-red-100 mt-0.5">
                  {appSettings.leaderboardAnnouncement || 'Honoring the extraordinary heroes saving lives across Bangladesh.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEditLeaderboard && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  <Edit3 size={11} />
                  <span>Admin Edit Mode</span>
                </span>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Impact Stats Banner */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-white/10">
              <p className="text-[10px] uppercase font-bold text-red-200">Total Donated</p>
              <p className="text-lg sm:text-xl font-black text-white">{totalDonations} Bags</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-white/10">
              <p className="text-[10px] uppercase font-bold text-amber-200 flex items-center justify-center gap-1">
                <Sparkles size={11} /> Lives Saved
              </p>
              <p className="text-lg sm:text-xl font-black text-amber-300">~{estimatedLivesSaved}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-white/10">
              <p className="text-[10px] uppercase font-bold text-red-200">Heroes Active</p>
              <p className="text-lg sm:text-xl font-black text-white">{donors.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search donor name, upazila, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Blood group pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGroup === bg
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Main List & Podium */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Podium (Top 3) */}
          {topThree.length > 0 && !searchQuery && selectedGroup === 'ALL' && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
                <span>Top Honored Champions</span>
                <span className="text-[10px] text-amber-600 font-bold">Hall of Fame</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center relative hover:shadow-md transition-all flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center absolute -top-3 shadow-xs">
                      2
                    </div>
                    <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-base mb-2">
                      {topThree[1].name.slice(0, 2).toUpperCase()}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{topThree[1].name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md mt-1">
                      {topThree[1].bloodGroup}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={11} /> {topThree[1].upazila || topThree[1].district || 'Mymensingh'}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 w-full flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Donated</span>
                      <span className="font-black text-slate-800 flex items-center gap-1">
                        <Heart size={12} className="text-red-500 fill-red-500" /> {topThree[1].donationsCount} times
                      </span>
                    </div>
                    {canEditLeaderboard && (
                      <button 
                        onClick={() => setEditingDonor({ ...topThree[1] })}
                        className="mt-2 text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit3 size={11} /> Edit Rank Info
                      </button>
                    )}
                  </div>
                )}

                {/* 1st Place (Winner) */}
                {topThree[0] && (
                  <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-center relative shadow-md hover:shadow-lg transition-all flex flex-col items-center order-first sm:order-none">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center absolute -top-4 shadow-md border-2 border-white">
                      👑 1
                    </div>
                    <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-black text-amber-800 text-lg mb-2 shadow-inner">
                      {topThree[0].name.slice(0, 2).toUpperCase()}
                    </div>
                    <h4 className="font-black text-base text-slate-900 line-clamp-1">{topThree[0].name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-black rounded-md">
                        {topThree[0].bloodGroup}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200">
                        {topThree[0].customRankTitle || 'Top Champion'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={11} /> {topThree[0].upazila || topThree[0].district || 'Mymensingh'}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-amber-100 w-full flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Donated</span>
                      <span className="font-black text-red-600 text-sm flex items-center gap-1">
                        <Heart size={14} className="text-red-600 fill-red-600" /> {topThree[0].donationsCount} times
                      </span>
                    </div>
                    {canEditLeaderboard && (
                      <button 
                        onClick={() => setEditingDonor({ ...topThree[0] })}
                        className="mt-2 text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit3 size={11} /> Edit Rank Info
                      </button>
                    )}
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center relative hover:shadow-md transition-all flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center absolute -top-3 shadow-xs">
                      3
                    </div>
                    <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center font-bold text-amber-900 text-base mb-2">
                      {topThree[2].name.slice(0, 2).toUpperCase()}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{topThree[2].name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md mt-1">
                      {topThree[2].bloodGroup}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={11} /> {topThree[2].upazila || topThree[2].district || 'Mymensingh'}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 w-full flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Donated</span>
                      <span className="font-black text-slate-800 flex items-center gap-1">
                        <Heart size={12} className="text-red-500 fill-red-500" /> {topThree[2].donationsCount} times
                      </span>
                    </div>
                    {canEditLeaderboard && (
                      <button 
                        onClick={() => setEditingDonor({ ...topThree[2] })}
                        className="mt-2 text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit3 size={11} /> Edit Rank Info
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Ranking List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>All Ranked Donors ({sortedDonors.length})</span>
              <span className="text-[11px] font-normal lowercase text-slate-400">ranked by total blood units</span>
            </h3>

            {sortedDonors.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Droplet size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No donors found matching criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the blood group filter or search query.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDonors.map((donor, index) => {
                  const rank = index + 1;
                  const tier = getTierBadge(donor.donationsCount || 0, donor.customRankTitle);
                  const elig = checkDonationEligibility(donor.lastDonationDate, donor.isAvailable);

                  return (
                    <div
                      key={donor.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        donor.isPinnedOnLeaderboard
                          ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                          : rank <= 3
                          ? 'bg-amber-50/20 border-amber-200/80 hover:bg-amber-50/50'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                            donor.isPinnedOnLeaderboard
                              ? 'bg-amber-500 text-white shadow-xs'
                              : rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : rank === 3
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {donor.isPinnedOnLeaderboard ? <Pin size={13} className="fill-white" /> : `#${rank}`}
                        </div>

                        {/* Donor Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-800 truncate">{donor.name}</h4>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md flex-shrink-0">
                              {donor.bloodGroup}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${tier.color} hidden sm:inline-block`}>
                              {tier.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" />
                              <span>{donor.upazila || donor.district || 'Mymensingh Sadar'}</span>
                            </span>
                            {elig.effectiveAvailability ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                                • Available (প্রস্তুত)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                • বিশ্রামে ({elig.daysRemaining} দিন বাকি)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Count & Action */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-red-600 font-black text-sm sm:text-base justify-end">
                            <Heart size={14} className="fill-red-600 text-red-600" />
                            <span>{donor.donationsCount || 0}</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-0.5">bags</span>
                          </div>
                          <p className="text-[10px] text-slate-400">~{(donor.donationsCount || 0) * 3} lives</p>
                        </div>

                        {/* Admin In-Place Edit Button */}
                        {canEditLeaderboard && (
                          <button
                            onClick={() => setEditingDonor({ ...donor })}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all"
                            title="Edit Leaderboard Details"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p>Donations are updated in real-time upon donor submission & admin approval.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* EDIT LEADERBOARD DONOR MODAL */}
      {editingDonor && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form 
            onSubmit={handleSaveLeaderboardDonor}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base">লিডারবোর্ড তথ্য পরিবর্তন</h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingDonor(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ডোনার নাম</label>
                <input 
                  type="text" 
                  value={editingDonor.name} 
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মোট রক্তদান সংখ্যা (Donations Count)
                </label>
                <input 
                  type="number" 
                  min={0}
                  value={editingDonor.donationsCount || 0} 
                  onChange={e => setEditingDonor({ ...editingDonor, donationsCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-slate-900 text-sm outline-none focus:bg-white focus:border-red-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">এটি লিডারবোর্ডে ডোনারের র‍্যাঙ্কিং নির্ধারণ করবে</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  কাস্টম সম্মাননা উপাধি / টাইটেল (Custom Honor Title)
                </label>
                <input 
                  type="text" 
                  placeholder="যেমন: Hero of the Month, Platinum Hero..."
                  value={editingDonor.customRankTitle || ''} 
                  onChange={e => setEditingDonor({ ...editingDonor, customRankTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:bg-white focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="pinCheck"
                  checked={editingDonor.isPinnedOnLeaderboard || false}
                  onChange={e => setEditingDonor({ ...editingDonor, isPinnedOnLeaderboard: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-amber-900 cursor-pointer flex items-center gap-1">
                  <Pin size={13} className="text-amber-600" />
                  <span>লিডারবোর্ডের শীর্ষে পিন করে রাখুন (Pin to Top)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDonor(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>লিডারবোর্ড আপডেট করুন</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
