
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Calendar, 
  History, 
  Trophy, 
  Edit3, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Facebook, 
  Mail,
  CreditCard,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Heart,
  Droplet,
  AlertCircle
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { User, BloodGroup, UserRole } from '../types';
import { checkDonationEligibility } from '../store';
import { SaveSuccessAnimation } from '../components/SaveSuccessAnimation';
import { 
  BANGLADESH_DATA, 
  DIVISIONS, 
  getDistrictsOfDivision, 
  getUpazilasOfDistrict 
} from '../bangladeshData';

interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onOpenCertificate?: () => void;
  onOpenMembershipCard?: () => void;
  onUpdateUser?: (updated: User) => void;
}

const ProfileView: React.FC<ProfileProps> = ({ 
  user, 
  setUser,
  onOpenCertificate,
  onOpenMembershipCard,
  onUpdateUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User>({ ...user });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showSaveSuccessAnim, setShowSaveSuccessAnim] = useState(false);
  const [saveSuccessDetails, setSaveSuccessDetails] = useState({
    title: "তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
    message: "আপনার সকল পরিবর্তন ডাটাবেজে আপডেট করা হয়েছে।"
  });

  const getBadge = (count: number) => {
    if (count >= 15) return { label: 'Legendary Saver', icon: '🏆', color: 'text-purple-600 bg-purple-50' };
    if (count >= 8) return { label: 'Gold Champion', icon: '🥇', color: 'text-amber-500 bg-amber-50' };
    if (count >= 4) return { label: 'Silver Guardian', icon: '🥈', color: 'text-slate-500 bg-slate-50' };
    if (count >= 1) return { label: 'Bronze Donor', icon: '🥉', color: 'text-orange-500 bg-orange-50' };
    return { label: 'Supporter', icon: '🌱', color: 'text-emerald-500 bg-emerald-50' };
  };

  const badge = getBadge(user.donationsCount || 0);
  const eligibility = checkDonationEligibility(user.lastDonationDate, user.isAvailable);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const persistUserUpdate = async (updated: User) => {
    setUser(updated);
    localStorage.setItem('fbdm_current_user', JSON.stringify(updated));

    // Update in registered accounts/users in localStorage
    try {
      const localUsers: User[] = JSON.parse(localStorage.getItem('fbdm_registered_users') || '[]');
      const updatedList = localUsers.map(u => u.id === updated.id ? { ...u, ...updated } : u);
      if (!updatedList.some(u => u.id === updated.id)) updatedList.push(updated);
      localStorage.setItem('fbdm_registered_users', JSON.stringify(updatedList));

      const localAccounts: { user: User; password?: string }[] = JSON.parse(
        localStorage.getItem('fbdm_registered_accounts') || '[]'
      );
      const accIndex = localAccounts.findIndex(a => a.user.id === updated.id);
      if (accIndex !== -1) {
        localAccounts[accIndex].user = { ...localAccounts[accIndex].user, ...updated };
        localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));
      }
    } catch (e) {
      console.warn("Local storage update notice:", e);
    }

    // Call prop update to update parent state, leaderboards and search
    onUpdateUser?.(updated);

    // Save to Firestore asynchronously
    if (isFirebaseConfigured) {
      try {
        const userRef = doc(db, "users", updated.id);
        await setDoc(userRef, updated, { merge: true });
      } catch (e) {
        console.warn("Could not save to firestore:", e);
      }
    }
  };

  // Quick Action: "আজ রক্ত দিয়েছি (Donated Blood Today)"
  const handleDonatedToday = async () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const newCount = (user.donationsCount || 0) + 1;
    const updated: User = {
      ...user,
      lastDonationDate: todayStr,
      donationsCount: newCount,
      isAvailable: false // Automatically forced not available for 90 days
    };

    await persistUserUpdate(updated);
    setEditData(updated);
    setSaveSuccessDetails({
      title: "রক্তদানের তথ্য সংরক্ষিত!",
      message: "আপনার সর্বশেষ রক্তদানের তারিখ ও সংখ্যা সফলভাবে আপডেট হয়েছে। লিডারবোর্ডে স্বয়ংক্রিয়ভাবে পয়েন্ট বৃদ্ধি পেয়েছে।"
    });
    setShowSaveSuccessAnim(true);
    showNotification('🩸 অভিনন্দন ও কৃতজ্ঞতা! আপনার রক্তদানের তথ্য সংরক্ষিত হয়েছে। পরবর্তী রক্তদানের জন্য ৯০ দিন বিশ্রাম প্রয়োজন (স্ট্যাটাস: অপেক্ষমান)।');
  };

  const handleRequestCardApproval = async () => {
    const updated: User = {
      ...user,
      cardRequestDate: new Date().toISOString()
    };
    await persistUserUpdate(updated);
    setEditData(updated);
    setSaveSuccessDetails({
      title: "অনুরোধ পাঠানো হয়েছে!",
      message: "মেম্বারশিপ কার্ডের জন্য এডমিন অনুমোদনের অনুরোধ সফলভাবে প্রেরণ করা হয়েছে। এডমিন অনুমোদন দিলে ডাউনলোড আনলক হবে।"
    });
    setShowSaveSuccessAnim(true);
    showNotification('মেম্বারশিপ কার্ড অনুমোদনের অনুরোধ সফলভাবে এডমিন প্যানেলে পাঠানো হয়েছে।');
  };

  const handleRequestCertApproval = async () => {
    const updated: User = {
      ...user,
      certificateRequestDate: new Date().toISOString()
    };
    await persistUserUpdate(updated);
    setEditData(updated);
    setSaveSuccessDetails({
      title: "অনুরোধ পাঠানো হয়েছে!",
      message: "ডিজিটাল সার্টিফিকেট এর জন্য এডমিন অনুমোদনের অনুরোধ সফলভাবে প্রেরণ করা হয়েছে।"
    });
    setShowSaveSuccessAnim(true);
    showNotification('সার্টিফিকেট অনুমোদনের অনুরোধ সফলভাবে এডমিন প্যানেলে পাঠানো হয়েছে।');
  };

  const handleSave = async () => {
    // Check eligibility logic on save
    let finalAvailable = editData.isAvailable;
    if (editData.lastDonationDate) {
      const check = checkDonationEligibility(editData.lastDonationDate, editData.isAvailable);
      if (!check.isEligible) {
        finalAvailable = false; // Cannot be available if donated within 90 days
      }
    }

    const updatedUser: User = {
      ...editData,
      division: editData.division || 'Mymensingh',
      district: editData.district || 'Mymensingh',
      upazila: editData.upazila || 'Mymensingh Sadar',
      donationsCount: Math.max(0, Number(editData.donationsCount) || 0),
      isAvailable: finalAvailable
    };

    await persistUserUpdate(updatedUser);
    setIsEditing(false);
    setSaveSuccessDetails({
      title: "প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
      message: "আপনার বিভাগ, জেলা, উপজেলা, রক্তদানের ইতিহাস ও ব্যক্তিগত তথ্য সফলভাবে আপডেট হয়েছে।"
    });
    setShowSaveSuccessAnim(true);
    showNotification('✅ প্রোফাইল ও রক্তদানের তথ্য সফলভাবে আপডেট হয়েছে! লিডারবোর্ড ও ডাটাবেজে সংরক্ষিত হয়েছে।');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">My Profile</h2>
          <p className="text-xs text-slate-500">আপনার ব্যক্তিগত তথ্য ও রক্তদানের ইতিহাস নিয়ন্ত্রণ করুন</p>
        </div>
        <button 
          onClick={() => {
            setEditData({ ...user });
            setIsEditing(!isEditing);
          }} 
          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          {isEditing ? 'বাতিল (Cancel)' : (
            <>
              <Edit3 size={15} />
              <span>তথ্য সংশোধন (Edit)</span>
            </>
          )}
        </button>
      </header>

      {/* Action Toast Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white px-2 py-0.5">✕</button>
        </div>
      )}

      {/* Profile Card */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-xs border border-slate-100 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-red-100 text-red-600 mx-auto flex items-center justify-center text-3xl font-black mb-4 border-4 border-white shadow-lg shadow-red-50">
            {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover rounded-[1.8rem]" alt="" /> : user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">{user.role}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood</p>
              <p className="text-xl font-black text-red-600">{user.bloodGroup}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">মোট রক্তদান</p>
              <p className="text-xl font-black text-slate-800">{user.donationsCount || 0} বার</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Badge</p>
              <p className="text-xl">{badge.icon}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
      </section>

      {/* Quick Action: "আজ রক্ত দিয়েছি" (Donated Blood Today) Button */}
      <section className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 rounded-3xl shadow-lg shadow-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            <Droplet size={12} className="text-white fill-white" />
            <span>তাৎক্ষণিক রক্তদান আপডেট</span>
          </div>
          <h4 className="font-black text-base">আজ রক্ত দিয়েছেন?</h4>
          <p className="text-xs text-red-100">
            এখানে এক ক্লিকে আপডেট করুন। মোট ডোনেশন সংখ্যা বাড়বে এবং পরবর্তী ৯০ দিনের জন্য অপেক্ষমান স্ট্যাটাস সেট হবে।
          </p>
        </div>

        <button
          onClick={handleDonatedToday}
          className="px-5 py-3 bg-white text-red-600 hover:bg-red-50 active:scale-95 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Heart size={16} className="text-red-600 fill-red-600" />
          <span>আজ রক্ত দিয়েছি (Donated Today)</span>
        </button>
      </section>

      {/* Eligibility Status Banner Card */}
      <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">রক্তদান যোগ্যতা ও প্রাপ্যতা</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${eligibility.statusBadge.colorClass}`}>
              {eligibility.statusBadge.text}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-bold">
            সর্বশেষ রক্তদান: <span className="font-mono text-red-600">{user.lastDonationDate || 'পূর্বে রক্ত দেননি'}</span>
          </p>
          <p className="text-[11px] text-slate-500">{eligibility.statusBadge.subText}</p>
        </div>

        <div className="flex items-center gap-2">
          {eligibility.isEligible ? (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 size={20} />
              <span>রক্তদানে সক্ষম</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl flex items-center gap-2 text-xs font-bold">
              <Clock size={20} />
              <span>বিশ্রাম প্রয়োজন ({eligibility.daysRemaining} দিন)</span>
            </div>
          )}
        </div>
      </section>

      {/* Donor ID Card & Certificate Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={onOpenMembershipCard}
              className="flex items-center gap-3.5 text-left flex-1"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <CreditCard size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs">My Membership Card</h4>
                <p className="text-[11px] text-red-100">Digital FBDM Donor ID Card</p>
              </div>
            </button>

            {/* Status indicator */}
            {user.isCardApproved || user.role === UserRole.ADMIN || user.role === UserRole.MAIN_ADMIN ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-black uppercase whitespace-nowrap">
                ✓ Approved
              </span>
            ) : user.cardRequestDate ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-bold whitespace-nowrap">
                ⏳ Pending
              </span>
            ) : (
              <button
                onClick={handleRequestCardApproval}
                className="px-2 py-0.5 rounded-full bg-white text-red-700 hover:bg-red-50 text-[10px] font-black shadow-xs whitespace-nowrap"
              >
                আবেদন করুন
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-red-100/90 pt-1 border-t border-white/10">
            <span>প্রোফাইল তথ্য অনুযায়ী কার্ড অটো-আপডেট হয়</span>
            <button 
              onClick={onOpenMembershipCard}
              className="font-bold hover:underline text-white flex items-center gap-1"
            >
              {user.isCardApproved ? 'কার্ড দেখুন / ডাউনলোড' : 'প্রিভিউ দেখুন'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-3.5 text-left flex-1"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Award size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Digital Certificate</h4>
                <p className="text-[11px] text-amber-100">Certificate of Appreciation</p>
              </div>
            </button>

            {/* Status indicator */}
            {user.isCertificateApproved || user.role === UserRole.ADMIN || user.role === UserRole.MAIN_ADMIN ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-black uppercase whitespace-nowrap">
                ✓ Approved
              </span>
            ) : user.certificateRequestDate ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-bold whitespace-nowrap">
                ⏳ Pending
              </span>
            ) : (
              <button
                onClick={handleRequestCertApproval}
                className="px-2 py-0.5 rounded-full bg-white text-amber-800 hover:bg-amber-50 text-[10px] font-black shadow-xs whitespace-nowrap"
              >
                আবেদন করুন
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-amber-100/90 pt-1 border-t border-white/10">
            <span>অফিসিয়াল সার্টিফিকেট ডাউনলোড করতে এডমিন এপ্রুভাল লাগে</span>
            <button 
              onClick={onOpenCertificate}
              className="font-bold hover:underline text-white flex items-center gap-1"
            >
              {user.isCertificateApproved ? 'সার্টিফিকেট প্রিন্ট' : 'প্রিভিউ দেখুন'}
            </button>
          </div>
        </div>
      </section>

      {/* EDIT PROFILE FORM */}
      {isEditing ? (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-5 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">প্রোফাইল ও রক্তদানের তথ্য সংশোধন</h3>
              <p className="text-xs text-slate-400">তথ্য পরিবর্তন করলে লিডারবোর্ড ও ড্যাশবোর্ডে সাথে সাথে আপডেট হবে</p>
            </div>
            <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Edit Mode
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">পূর্ণ নাম (Full Name)</label>
              <input 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">রক্তের গ্রুপ (Blood Group)</label>
              <select 
                value={editData.bloodGroup} 
                onChange={e => setEditData({...editData, bloodGroup: e.target.value as BloodGroup})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500"
              >
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>

            {/* Complete Bangladesh Division, District & Upazila Cascading Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">বিভাগ (Division)</label>
                <select 
                  value={editData.division || 'Mymensingh'} 
                  onChange={e => {
                    const newDiv = e.target.value;
                    const dists = getDistrictsOfDivision(newDiv);
                    const firstDist = dists[0] || '';
                    const upzs = getUpazilasOfDistrict(newDiv, firstDist);
                    setEditData({
                      ...editData, 
                      division: newDiv,
                      district: firstDist,
                      upazila: upzs[0] || ''
                    });
                  }} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500"
                >
                  {DIVISIONS.map(divKey => {
                    const dData = BANGLADESH_DATA[divKey];
                    return (
                      <option key={divKey} value={divKey}>
                        {dData?.bnName || divKey} ({divKey})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">জেলা (District)</label>
                <select 
                  value={editData.district || 'Mymensingh'} 
                  onChange={e => {
                    const newDist = e.target.value;
                    const upzs = getUpazilasOfDistrict(editData.division || 'Mymensingh', newDist);
                    setEditData({
                      ...editData, 
                      district: newDist,
                      upazila: upzs[0] || ''
                    });
                  }} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500"
                >
                  {getDistrictsOfDivision(editData.division || 'Mymensingh').map(dist => {
                    const dData = BANGLADESH_DATA[editData.division || 'Mymensingh']?.districts[dist];
                    return (
                      <option key={dist} value={dist}>
                        {dData?.bnName || dist} ({dist})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">উপজেলা (Upazila)</label>
                <select 
                  value={editData.upazila || 'Mymensingh Sadar'} 
                  onChange={e => setEditData({...editData, upazila: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-red-500"
                >
                  {getUpazilasOfDistrict(editData.division || 'Mymensingh', editData.district || 'Mymensingh').map(upz => (
                    <option key={upz} value={upz}>{upz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Donation Count & Last Donation Date */}
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-red-700">
                <Droplet size={14} className="fill-red-600" />
                <span>রক্তদানের ইতিহাস ও তারিখ সংশোধন</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    সর্বশেষ রক্তদানের তারিখ (Last Donation Date)
                  </label>
                  <input 
                    type="date"
                    value={editData.lastDonationDate || ''} 
                    onChange={e => setEditData({...editData, lastDonationDate: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">তারিখ ৯০ দিনের কম হলে স্বয়ংক্রিয়ভাবে অপেক্ষমান থাকবে</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মোট কতবার রক্ত দিয়েছেন? (Donation Count)
                  </label>
                  <input 
                    type="number"
                    min={0}
                    value={editData.donationsCount} 
                    onChange={e => setEditData({...editData, donationsCount: parseInt(e.target.value) || 0})} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">এটি লিডারবোর্ডে আপনার রেংক নির্ধারণ করে</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="availCheck"
                  checked={editData.isAvailable}
                  onChange={e => setEditData({...editData, isAvailable: e.target.checked})}
                  className="w-4 h-4 text-red-600 rounded cursor-pointer"
                />
                <label htmlFor="availCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  আমি স্বেচ্ছায় রক্তদানের জন্য প্রস্তুত ও উপলব্ধ আছি (Mark Available)
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">ঠিকানা (Full Address)</label>
              <textarea 
                value={editData.address} 
                onChange={e => setEditData({...editData, address: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-red-500" 
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">মোবাইল নাম্বার (Mobile)</label>
                <input 
                  value={editData.mobile} 
                  onChange={e => setEditData({...editData, mobile: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold outline-none focus:bg-white focus:border-red-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">হোয়াটসঅ্যাপ (WhatsApp)</label>
                <input 
                  value={editData.whatsapp} 
                  onChange={e => setEditData({...editData, whatsapp: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold outline-none focus:bg-white focus:border-red-500" 
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                বাতিল করুন
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-red-200 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>পরিবর্তন সংরক্ষণ করুন (Save)</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Details List */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                <p className="text-xs font-bold text-slate-800">
                  {user.address ? `${user.address}, ` : ''}
                  {user.upazila ? `${user.upazila}, ` : ''}
                  {user.district || 'Mymensingh'}, {user.division || 'Bangladesh'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Phone size={18} /></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p><p className="text-xs font-mono font-bold text-slate-800">{user.mobile}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MessageSquare size={18} /></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</p><p className="text-xs font-mono font-bold text-slate-800">{user.whatsapp}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Trophy size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Rank</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{badge.label}</p>
                  <span className="text-base">{badge.icon}</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Save Success Animation Modal / Toast */}
      <SaveSuccessAnimation
        isOpen={showSaveSuccessAnim}
        onClose={() => setShowSaveSuccessAnim(false)}
        title={saveSuccessDetails.title}
        message={saveSuccessDetails.message}
        subMessage="সার্টিফিকেট, মেম্বারশিপ কার্ড ও লিডারবোর্ডে সাথে সাথে তথ্য আপডেট হয়েছে"
      />
    </div>
  );
};

export default ProfileView;
