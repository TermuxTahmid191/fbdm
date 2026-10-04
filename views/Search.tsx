
import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Phone, MessageSquare, Filter, CheckCircle, Clock, Calendar, User as UserIcon, RotateCcw } from 'lucide-react';
import { User, BloodGroup } from '../types';
import { checkDonationEligibility } from '../store';
import { 
  BANGLADESH_DATA, 
  DIVISIONS, 
  getDistrictsOfDivision, 
  getUpazilasOfDistrict 
} from '../bangladeshData';

interface SearchProps {
  donors: User[];
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const SearchView: React.FC<SearchProps> = ({ donors }) => {
  const [searchGroup, setSearchGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredDonors = donors.filter(donor => {
    const groupMatch = searchGroup === 'ALL' || donor.bloodGroup === searchGroup;
    
    // Division filter
    const divisionMatch = selectedDivision === 'ALL' || 
      (donor.division && donor.division.toLowerCase() === selectedDivision.toLowerCase());
      
    // District filter
    const districtMatch = selectedDistrict === 'ALL' || 
      (donor.district && donor.district.toLowerCase() === selectedDistrict.toLowerCase());

    // Upazila filter
    const upazilaMatch = selectedUpazila === 'ALL' || 
      (donor.upazila && donor.upazila.toLowerCase() === selectedUpazila.toLowerCase());

    // Free text query match
    const q = searchQuery.toLowerCase().trim();
    const textMatch = !q || 
      (donor.name && donor.name.toLowerCase().includes(q)) ||
      (donor.address && donor.address.toLowerCase().includes(q)) ||
      (donor.upazila && donor.upazila.toLowerCase().includes(q)) ||
      (donor.district && donor.district.toLowerCase().includes(q)) ||
      (donor.division && donor.division.toLowerCase().includes(q));

    const eligibility = checkDonationEligibility(donor.lastDonationDate, donor.isAvailable);
    if (onlyAvailable && !eligibility.effectiveAvailability) return false;

    return groupMatch && divisionMatch && districtMatch && upazilaMatch && textMatch && donor.isApproved;
  });

  const handleResetFilters = () => {
    setSearchGroup('ALL');
    setSearchQuery('');
    setSelectedDivision('ALL');
    setSelectedDistrict('ALL');
    setSelectedUpazila('ALL');
    setOnlyAvailable(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">Find Donors (সারাদেশে রক্তদাতা অনুসন্ধান)</h2>
          <p className="text-xs text-slate-500">
            সমগ্র বাংলাদেশের বিভাগ, জেলা ও উপজেলা অনুযায়ী রক্তদাতা খুঁজুন। লাস্ট ডোনেট ডেট অনুযায়ী রিয়েল-টাইম প্রাপ্যতা প্রদর্শিত হয়।
          </p>
        </div>
        {(selectedDivision !== 'ALL' || selectedDistrict !== 'ALL' || selectedUpazila !== 'ALL' || searchGroup !== 'ALL' || searchQuery || onlyAvailable) && (
          <button
            onClick={handleResetFilters}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>ফিল্টার রিসেট</span>
          </button>
        )}
      </header>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Blood Group</label>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                onlyAvailable 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle size={13} />
              <span>শুধু প্রস্তুত ডোনার (Available Only)</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSearchGroup('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${searchGroup === 'ALL' ? 'bg-red-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              All Groups
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

        {/* Bangladesh Geographic Filters: Division, District, Upazila */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              বিভাগ (Division)
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('ALL');
                setSelectedUpazila('ALL');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500"
            >
              <option value="ALL">সকল বিভাগ (All Bangladesh)</option>
              {DIVISIONS.map(divKey => {
                const divData = BANGLADESH_DATA[divKey];
                return (
                  <option key={divKey} value={divKey}>
                    {divData?.bnName || divKey} ({divKey})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              জেলা (District)
            </label>
            <select
              value={selectedDistrict}
              disabled={selectedDivision === 'ALL'}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedUpazila('ALL');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500 disabled:opacity-50"
            >
              <option value="ALL">
                {selectedDivision === 'ALL' ? 'প্রথমে বিভাগ সিলেক্ট করুন' : 'সকল জেলা (All Districts)'}
              </option>
              {selectedDivision !== 'ALL' && getDistrictsOfDivision(selectedDivision).map(dist => {
                const dData = BANGLADESH_DATA[selectedDivision]?.districts[dist];
                return (
                  <option key={dist} value={dist}>
                    {dData?.bnName || dist} ({dist})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              উপজেলা (Upazila)
            </label>
            <select
              value={selectedUpazila}
              disabled={selectedDistrict === 'ALL'}
              onChange={(e) => setSelectedUpazila(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500 disabled:opacity-50"
            >
              <option value="ALL">
                {selectedDistrict === 'ALL' ? 'প্রথমে জেলা সিলেক্ট করুন' : 'সকল উপজেলা (All Upazilas)'}
              </option>
              {selectedDivision !== 'ALL' && selectedDistrict !== 'ALL' && 
                getUpazilasOfDistrict(selectedDivision, selectedDistrict).map(upz => (
                  <option key={upz} value={upz}>{upz}</option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Free text search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="রক্তদাতার নাম, এলাকা, রোড, বা স্থান লিখে খুঁজুন (Search by name or keyword)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:bg-white focus:border-red-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-700">
            {filteredDonors.length} জন রক্তদাতা পাওয়া গেছে
          </p>
          <span className="text-[11px] text-slate-400">সর্বশেষ ডোনেট ৯০ দিনের মধ্যে হলে অপেক্ষমান দেখাবে</span>
        </div>

        {filteredDonors.length > 0 ? (
          filteredDonors.map(donor => {
            const eligibility = checkDonationEligibility(donor.lastDonationDate, donor.isAvailable);
            const cleanPhone = donor.mobile?.replace(/\D/g, '');
            const cleanWhatsApp = donor.whatsapp?.replace(/\D/g, '') || cleanPhone;

            return (
              <div key={donor.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xl">
                    {donor.profilePic ? <img src={donor.profilePic} className="w-full h-full object-cover rounded-2xl" alt="" /> : donor.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-red-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-xs">
                    {donor.bloodGroup}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{donor.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-red-500 flex-shrink-0" /> 
                        <span className="truncate">
                          {donor.address ? `${donor.address}, ` : ''}
                          {donor.upazila ? `${donor.upazila}, ` : ''}
                          {donor.district || 'Mymensingh'}, {donor.division || 'Bangladesh'}
                        </span>
                      </p>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="flex flex-col items-start sm:items-end">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${eligibility.statusBadge.colorClass} flex items-center gap-1`}>
                        {eligibility.effectiveAvailability ? (
                          <CheckCircle size={11} className="text-emerald-600" />
                        ) : (
                          <Clock size={11} className="text-amber-600" />
                        )}
                        <span>{eligibility.statusBadge.text}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {donor.donationsCount ? `মোট ${donor.donationsCount} বার রক্ত দিয়েছেন` : 'নতুন রক্তদাতা'}
                      </span>
                    </div>
                  </div>

                  {/* Last Donation Date info banner */}
                  <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 flex items-center justify-between border border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span>সর্বশেষ রক্তদান: {donor.lastDonationDate || 'রেকর্ড নেই'}</span>
                    </span>
                    <span className="text-slate-400 font-medium">{eligibility.statusBadge.subText}</span>
                  </div>

                  {/* Direct Dial and WhatsApp Buttons */}
                  <div className="flex gap-2 pt-1">
                    <a 
                      href={`tel:${cleanPhone}`}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Phone size={14} /> 
                      <span>কল করুন ({donor.mobile})</span>
                    </a>
                    <a 
                      href={`https://wa.me/88${cleanWhatsApp}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <MessageSquare size={14} /> 
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100 p-6">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <SearchIcon size={28} />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">কোন রক্তদাতা পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-0.5">অন্য কোনো রক্তের গ্রুপ বা এলাকা নির্বাচন করে অনুসন্ধান করুন।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
