
import React, { useState } from 'react';
/* Added User as UserIcon to imports */
import { Search as SearchIcon, MapPin, Phone, MessageSquare, Filter, CheckCircle, User as UserIcon } from 'lucide-react';
import { User, BloodGroup } from '../types';

interface SearchProps {
  donors: User[];
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const SearchView: React.FC<SearchProps> = ({ donors }) => {
  const [searchGroup, setSearchGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [searchLocation, setSearchLocation] = useState('');

  const filteredDonors = donors.filter(donor => {
    const groupMatch = searchGroup === 'ALL' || donor.bloodGroup === searchGroup;
    const locationMatch = donor.address.toLowerCase().includes(searchLocation.toLowerCase()) || 
                         donor.upazila.toLowerCase().includes(searchLocation.toLowerCase());
    return groupMatch && locationMatch && donor.isApproved;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Find Donors</h2>
        <p className="text-sm text-slate-500">Search reliable blood donors in Mymensingh area.</p>
      </header>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Blood Group</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSearchGroup('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${searchGroup === 'ALL' ? 'bg-red-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              All
            </button>
            {BLOOD_GROUPS.map(group => (
              <button 
                key={group}
                onClick={() => setSearchGroup(group)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${searchGroup === group ? 'bg-red-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by area (e.g. Sadar, Trishal, Medical...)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-red-100 transition-all outline-none"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-bold text-slate-800">{filteredDonors.length} Donors Found</p>
          <button className="text-slate-400"><Filter size={18} /></button>
        </div>

        {filteredDonors.length > 0 ? (
          filteredDonors.map(donor => (
            <div key={donor.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  {donor.profilePic ? <img src={donor.profilePic} className="w-full h-full object-cover rounded-2xl" alt="" /> : <UserIcon size={24} />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                  {donor.bloodGroup}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-base">{donor.name}</h4>
                  {donor.isAvailable && (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle size={10} /> AVAILABLE
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin size={12} /> {donor.upazila}, {donor.district}
                </p>

                <div className="flex gap-2">
                  <button className="flex-1 bg-red-50 text-red-600 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                    <Phone size={14} /> Call
                  </button>
                  <button className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors">
                    <MessageSquare size={14} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <SearchIcon size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-800">No donors found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search area.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
