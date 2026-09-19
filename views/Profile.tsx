
import React, { useState } from 'react';
import { User as UserIcon, Settings, Calendar, History, Trophy, Edit3, MapPin, Phone, MessageSquare, Facebook, Mail } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, BloodGroup } from '../types';

interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ProfileView: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({...user});

  const getBadge = (count: number) => {
    if (count >= 8) return { label: 'Gold Donor', icon: '🥇', color: 'text-amber-500 bg-amber-50' };
    if (count >= 4) return { label: 'Silver Donor', icon: '🥈', color: 'text-slate-400 bg-slate-50' };
    if (count >= 1) return { label: 'Bronze Donor', icon: '🥉', color: 'text-orange-500 bg-orange-50' };
    return { label: 'Supporter', icon: '🌱', color: 'text-green-500 bg-green-50' };
  };

  const badge = getBadge(user.donationsCount);

  const calculateNextDate = (last: string | null) => {
    if (!last) return 'Available Now';
    const lastDate = new Date(last);
    const nextDate = new Date(lastDate.setMonth(lastDate.getMonth() + 4));
    const today = new Date();
    if (nextDate <= today) return 'Available Now';
    return nextDate.toLocaleDateString();
  };

  const nextEligible = calculateNextDate(user.lastDonationDate);

  const handleSave = async () => {
    setUser(editData);
    localStorage.setItem('fbdm_current_user', JSON.stringify(editData));
    try {
      const userRef = doc(db, "users", editData.id);
      await setDoc(userRef, editData, { merge: true });
    } catch (e) {
      console.warn("Could not save to firestore:", e);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Profile Settings</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
        >
          {isEditing ? 'Cancel' : <Edit3 size={20} />}
        </button>
      </header>

      {/* Profile Card */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-red-100 text-red-600 mx-auto flex items-center justify-center text-3xl font-black mb-4 border-4 border-white shadow-lg shadow-red-50">
            {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover rounded-[1.8rem]" alt="" /> : user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">{user.role}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood</p>
              <p className="text-lg font-black text-red-600">{user.bloodGroup}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Donated</p>
              <p className="text-lg font-black text-slate-800">{user.donationsCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Badge</p>
              <p className="text-lg">{badge.icon}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
      </section>

      {isEditing ? (
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-5 animate-in slide-in-from-top-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
              <select value={editData.bloodGroup} onChange={e => setEditData({...editData, bloodGroup: e.target.value as BloodGroup})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm">
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Upazila</label>
              <input value={editData.upazila} onChange={e => setEditData({...editData, upazila: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
            <textarea value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm" rows={2}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
              <input value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
              <input value={editData.whatsapp} onChange={e => setEditData({...editData, whatsapp: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm" />
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Save Changes
          </button>
        </section>
      ) : (
        <>
          {/* Eligibility Card */}
          <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eligibility Status</p>
              <p className="text-sm font-black text-slate-800">
                Next Donation: <span className={nextEligible === 'Available Now' ? 'text-green-600' : 'text-amber-600'}>{nextEligible}</span>
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${nextEligible === 'Available Now' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <Calendar size={20} />
            </div>
          </section>

          {/* Details List */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
               <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p><p className="text-sm font-bold text-slate-800">{user.address}</p></div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Phone size={18} /></div>
               <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p><p className="text-sm font-bold text-slate-800">{user.mobile}</p></div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MessageSquare size={18} /></div>
               <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</p><p className="text-sm font-bold text-slate-800">{user.whatsapp}</p></div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Trophy size={18} /></div>
               <div className="flex-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Rank</p>
                 <div className="flex items-center justify-between">
                   <p className="text-sm font-bold text-slate-800">{badge.label}</p>
                   <span className="text-lg">{badge.icon}</span>
                 </div>
               </div>
             </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ProfileView;
