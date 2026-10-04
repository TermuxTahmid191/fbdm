import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCw, 
  Download, 
  Printer, 
  Heart, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  Send
} from 'lucide-react';
import { User, AppSettings, UserRole } from '../types';
import { initialAppSettings } from '../store';

interface MembershipCardProps {
  user: User;
  onClose?: () => void;
  appSettings?: AppSettings;
  onRequestApproval?: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ 
  user, 
  onClose,
  appSettings = initialAppSettings,
  onRequestApproval
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRequested, setHasRequested] = useState(Boolean(user.cardRequestDate));

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.MAIN_ADMIN || user.role === UserRole.MODERATOR;
  const isApproved = user.isCardApproved || isAdmin;

  const memberId = `FBDM-${(user.id || '2026').replace(/\D/g, '').slice(-5) || '92041'}`;
  const issueYear = new Date().getFullYear();

  // Next eligible date calculation
  const getNextEligibleDate = () => {
    if (!user.lastDonationDate) return 'Eligible Right Now';
    const lastDate = typeof user.lastDonationDate === 'object' && user.lastDonationDate.seconds 
      ? new Date(user.lastDonationDate.seconds * 1000)
      : new Date(user.lastDonationDate);
    if (isNaN(lastDate.getTime())) return 'Eligible Right Now';
    
    // 90 days after last donation
    const nextDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    return nextDate <= new Date() ? 'Eligible Right Now' : nextDate.toLocaleDateString('en-GB');
  };

  const handlePrint = () => {
    if (!isApproved) return;
    window.print();
  };

  const handleSendApprovalRequest = () => {
    setHasRequested(true);
    onRequestApproval?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Digital Donor Membership Card</h3>
              <p className="text-xs text-slate-400">Official Life Saver ID • {appSettings.orgName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCw size={15} />
              <span>Flip Card</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Approval Status Banner (Required as per prompt) */}
        {!isApproved && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900">
              <Lock size={18} className="text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-extrabold">মেম্বারশিপ কার্ড ডাউনলোড করতে এডমিন এপ্রুভাল প্রয়োজন:</span>{' '}
                <span className="text-amber-800">
                  {hasRequested 
                    ? 'আপনার আবেদন এডমিনের অনুমোদনের অপেক্ষায় রয়েছে।' 
                    : 'ডিজিটাল কার্ড ডাউনলোড বা প্রিন্ট করতে এডমিন অনুমোদনের অনুরোধ পাঠান।'}
                </span>
              </div>
            </div>

            {!hasRequested ? (
              <button
                onClick={handleSendApprovalRequest}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                <Send size={13} />
                <span>অনুমোদনের আবেদন</span>
              </button>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-amber-200/80 text-amber-900 font-bold flex items-center gap-1 self-start sm:self-auto">
                <Clock size={13} />
                <span>আবেদন পেন্ডিং</span>
              </span>
            )}
          </div>
        )}

        {/* Card Canvas Container */}
        <div className="p-6 sm:p-10 bg-slate-100 flex flex-col items-center justify-center">
          
          <p className="text-xs font-medium text-slate-500 mb-4 text-center">
            {isFlipped ? 'Showing Back of ID Card (Tap to flip)' : 'Showing Front of ID Card (Tap to flip)'}
          </p>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-[420px] aspect-[1.586/1] cursor-pointer perspective-1000 select-none"
          >
            {!isFlipped ? (
              /* FRONT OF CARD - Auto-updated from user's live profile & appSettings */
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-900 text-white p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-red-400/30">
                {/* Background Patterns */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-lg pointer-events-none" />

                {/* Top Bar: Brand & Badge */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center shadow">
                      <Heart size={18} className="fill-red-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-tight leading-none uppercase">FBDM</h4>
                      <p className="text-[9px] text-red-100 font-medium tracking-wider truncate max-w-[180px]">
                        {appSettings.orgName}
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} className={isApproved ? "text-emerald-300" : "text-amber-300"} />
                    <span>{isApproved ? "Verified Donor" : "Pending Auth"}</span>
                  </div>
                </div>

                {/* Center Content: Photo, Details & Blood Group (Live User Data) */}
                <div className="flex items-center gap-4 my-auto z-10">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 p-1 border-2 border-white/40 shadow-inner flex items-center justify-center overflow-hidden">
                      {user.profilePic ? (
                        <img 
                          src={user.profilePic} 
                          alt={user.name} 
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-2xl font-black text-white">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-red-700 flex items-center justify-center">
                      <CheckCircle2 size={13} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight truncate">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-red-200 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={11} /> {user.upazila || user.district || 'Mymensingh'}, {user.district || user.division || 'Bangladesh'}
                    </p>
                    <p className="text-[10px] text-red-200/80 font-mono mt-1">
                      ID: <span className="font-bold text-white tracking-wider">{memberId}</span>
                    </p>
                  </div>

                  {/* Blood Group Pill */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-red-600 flex flex-col items-center justify-center shadow-lg flex-shrink-0 border-2 border-red-100">
                    <span className="text-xs font-bold leading-none uppercase text-slate-500">Group</span>
                    <span className="text-xl sm:text-2xl font-black leading-none mt-1">{user.bloodGroup}</span>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between z-10 pt-2 border-t border-white/15 text-[10px] text-red-150">
                  <div className="flex items-center gap-1 text-red-100">
                    <span>Member Since {issueYear}</span>
                    <span>•</span>
                    <span className="text-emerald-200 font-semibold">{user.donationsCount || 0} Donations</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px] text-red-200">
                    <span>{appSettings.cardIssuerTitle || 'FBDM Central'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* BACK OF CARD */
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-slate-700">
                {/* Magnetic Strip Representation */}
                <div className="w-full h-8 bg-slate-950 -mx-5 -mt-2 mb-2 flex items-center px-4">
                  <span className="text-[8px] tracking-widest text-slate-500 font-mono uppercase">
                    {appSettings.orgName} EMERGENCY VERIFICATION
                  </span>
                </div>

                {/* Emergency Contact & Vital Info */}
                <div className="grid grid-cols-2 gap-3 text-[11px] my-auto">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Phone size={10} className="text-red-400" /> Donor Mobile
                    </p>
                    <p className="font-bold text-white mt-0.5 font-mono">{user.mobile || 'Not specified'}</p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Calendar size={10} className="text-emerald-400" /> Next Eligible Date
                    </p>
                    <p className="font-bold text-emerald-400 mt-0.5">{getNextEligibleDate()}</p>
                  </div>

                  <div className="col-span-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/40 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold">Emergency 24/7 Hotline</p>
                      <p className="text-[10px] text-red-300 font-mono font-bold">
                        {appSettings.cardHospitalHotline || appSettings.emergencyHotline}
                      </p>
                    </div>
                    {/* Hologram Stamp */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-900 flex items-center justify-center shadow text-[8px] font-black">
                      SEAL
                    </div>
                  </div>
                </div>

                {/* Disclaimer & Barcode representation */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
                  <p className="max-w-[240px] leading-tight">
                    This card certifies registration in {appSettings.orgName}'s volunteer network. Valid across all certified healthcare facilities.
                  </p>
                  <div className="text-right font-mono text-[9px] text-slate-300 font-bold">
                    {isApproved ? 'VERIFIED ID' : 'PENDING'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Carry this card on your phone or in print when visiting medical colleges & donor drives.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RotateCw size={15} />
            {isFlipped ? 'Show Front' : 'Show Back'}
          </button>

          <button
            onClick={handlePrint}
            disabled={!isApproved}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              isApproved 
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isApproved ? <Printer size={16} /> : <Lock size={16} />}
            <span>Print / Save Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};
