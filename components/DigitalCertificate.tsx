import React, { useState, useRef } from 'react';
import { 
  Award, 
  Download, 
  Printer, 
  CheckCircle, 
  Heart, 
  Share2, 
  Sparkles, 
  X,
  ShieldCheck,
  Lock,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { User, AppSettings, UserRole } from '../types';
import { initialAppSettings } from '../store';

interface DigitalCertificateProps {
  user: User;
  onClose?: () => void;
  appSettings?: AppSettings;
  onRequestApproval?: () => void;
}

export const DigitalCertificate: React.FC<DigitalCertificateProps> = ({ 
  user, 
  onClose,
  appSettings = initialAppSettings,
  onRequestApproval
}) => {
  const [certType, setCertType] = useState<'BLOOD' | 'FINANCIAL'>('BLOOD');
  const [copied, setCopied] = useState(false);
  const [hasRequested, setHasRequested] = useState(Boolean(user.certificateRequestDate));

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.MAIN_ADMIN || user.role === UserRole.MODERATOR;
  const isApproved = user.isCertificateApproved || isAdmin;

  const certId = `FBDM-${certType === 'BLOOD' ? 'BLD' : 'FIN'}-${(user.id || '2026').replace(/\D/g, '').slice(-4) || '7842'}-${new Date().getFullYear()}`;
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    if (!isApproved) return;
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s FBDM Certificate of Appreciation`,
        text: `Recognized by ${appSettings.orgName} for life-saving contributions! Certificate ID: ${certId}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`FBDM Certified Donor: ${user.name} | Blood Group: ${user.bloodGroup} | Certificate ID: ${certId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendApprovalRequest = () => {
    setHasRequested(true);
    onRequestApproval?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Digital Donation Certificate</h3>
              <p className="text-xs text-slate-400">Verified by {appSettings.orgName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!isApproved}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                isApproved 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer' 
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
              }`}
              title={isApproved ? "Print Certificate" : "এডমিন অনুমোদন প্রয়োজন"}
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Share Certificate"
            >
              {copied ? <CheckCircle size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
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
                <span className="font-extrabold">সার্টিফিকেট ডাউনলোড করতে এডমিন এপ্রুভাল প্রয়োজন:</span>{' '}
                <span className="text-amber-800">
                  {hasRequested 
                    ? 'আপনার আবেদনের অনুরোধ এডমিন প্যানেলে পাঠানো হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।' 
                    : 'অফিসিয়াল সার্টিফিকেট ডাউনলোড করার জন্য এডমিনের অনুমোদনের আবেদন করুন।'}
                </span>
              </div>
            </div>

            {!hasRequested ? (
              <button
                onClick={handleSendApprovalRequest}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                <Send size={13} />
                <span>অনুমোদনের আবেদন করুন</span>
              </button>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-amber-200/80 text-amber-900 font-bold flex items-center gap-1 self-start sm:self-auto">
                <Clock size={13} />
                <span>আবেদন পেন্ডিং রয়েছে</span>
              </span>
            )}
          </div>
        )}

        {/* Certificate Type Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setCertType('BLOOD')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              certType === 'BLOOD'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Blood Donation Recognition
          </button>
          <button
            onClick={() => setCertType('FINANCIAL')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              certType === 'FINANCIAL'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Financial Patron Recognition
          </button>
        </div>

        {/* CERTIFICATE CANVAS */}
        <div className="p-4 sm:p-8 bg-slate-100 overflow-x-auto flex justify-center">
          <div 
            className="w-full max-w-[680px] bg-white border-8 border-slate-900 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center rounded-2xl select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fafafa 100%)'
            }}
          >
            {/* Watermark Pattern */}
            <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
              <Award size={360} className="text-red-900" />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-red-600" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-red-600" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-red-600" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-red-600" />

            {/* Top Emblem & Org Info (Auto-updated from appSettings) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md mb-2">
                <Heart size={26} className="fill-white" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-red-600">
                {appSettings.orgName || 'Friends Blood Donation Mymensingh (FBDM)'}
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider">
                {appSettings.tagline || 'স্বেচ্ছায় করি রক্তদান, হাসবে রোগী বাঁচবে প্রাণ'}
              </p>
              {appSettings.certFounderName && (
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                  প্রতিষ্ঠাতা: {appSettings.certFounderName}
                </p>
              )}
            </div>

            {/* Title Section */}
            <div className="relative z-10 my-4 border-t border-b border-amber-300/80 py-3">
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-slate-900 uppercase">
                Certificate of Appreciation
              </h1>
              <p className="text-xs font-serif italic text-amber-800 mt-0.5">
                মানবতার সেবায় রক্তদান স্বীকৃতি স্মারক
              </p>
            </div>

            {/* Presented To (Auto-updated from user's live profile) */}
            <div className="relative z-10 space-y-1 my-3">
              <p className="text-[11px] text-slate-500 font-serif italic">This honor is proudly conferred upon</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-red-700 tracking-tight underline decoration-amber-400 decoration-2 underline-offset-4">
                {user.name}
              </h2>
              <p className="text-xs text-slate-600 font-bold pt-1">
                রক্তের গ্রুপ: <span className="text-red-600 font-black">{user.bloodGroup}</span> • এলাকা: {user.upazila || user.district || 'Mymensingh'}, {user.division || 'Bangladesh'}
              </p>
            </div>

            {/* Description Paragraph */}
            <div className="relative z-10 max-w-lg mx-auto text-xs text-slate-600 leading-relaxed font-serif">
              {certType === 'BLOOD' ? (
                <p>
                  In sincere gratitude for your selfless voluntary blood donations that have directly saved precious lives in emergency medical crises. Your courage, generosity, and humanitarian devotion inspire our entire community.
                </p>
              ) : (
                <p>
                  In deep appreciation for your invaluable financial contributions supporting emergency blood bags, donor welfare, and patient transport in Mymensingh.
                </p>
              )}
            </div>

            {/* Metrics & Badges (Auto-updated from user profile) */}
            <div className="relative z-10 my-5 flex flex-wrap items-center justify-center gap-4 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <Heart size={16} className="fill-red-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Donations</p>
                  <p className="text-sm font-black text-slate-800">{user.donationsCount || 1} Times Donated</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Admin Status</p>
                  <p className="text-sm font-black text-emerald-700">
                    {isApproved ? 'Approved & Authenticated' : 'Pending Approval'}
                  </p>
                </div>
              </div>
            </div>

            {/* Signatures & Seal Section (Dynamic from appSettings) */}
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              {/* Left Signature */}
              <div className="text-center sm:text-left min-w-[120px]">
                <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-400 pb-1 mb-1">
                  {appSettings.certSignatoryName1 || 'Dr. K. R. Mymensingh'}
                </div>
                <p className="font-bold text-slate-800 text-[11px]">{appSettings.certSignatoryTitle1 || 'President'}</p>
                <p className="text-[9px] text-slate-500">{appSettings.orgName}</p>
              </div>

              {/* Center Official Gold Seal */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 flex flex-col items-center justify-center shadow-lg border-2 border-amber-600 p-2 transform rotate-3 flex-shrink-0">
                <Sparkles size={16} className="text-amber-900" />
                <span className="text-[8px] font-black uppercase text-center leading-tight mt-0.5">
                  {appSettings.certSealText || 'FBDM SEAL'}
                </span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-amber-900">VERIFIED</span>
              </div>

              {/* Right Signature */}
              <div className="text-center sm:text-right min-w-[120px]">
                <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-400 pb-1 mb-1">
                  {appSettings.certSignatoryName2 || 'Md. Jahirul Islam'}
                </div>
                <p className="font-bold text-slate-800 text-[11px]">{appSettings.certSignatoryTitle2 || 'General Secretary'}</p>
                <p className="text-[9px] text-slate-500">{appSettings.orgName}</p>
              </div>
            </div>

            {/* Certificate ID & Verification Footer */}
            <div className="relative z-10 mt-6 pt-3 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
              <p className="font-mono">Certificate ID: <span className="font-bold text-slate-600">{certId}</span></p>
              <p>Issued on: <span className="font-semibold text-slate-600">{issueDate}</span></p>
              <p className="flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle size={11} /> Authenticated by {appSettings.orgName}
              </p>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {isApproved 
              ? 'আপনার সার্টিফিকেট অনুমোদিত। এটি হাসপাতাল বা রক্তদান ক্যাম্পে প্রদর্শনযোগ্য।' 
              : 'এডমিন এপ্রুভাল ছাড়া সার্টিফিকেট ডাউনলোড করা যাবে না।'}
          </p>
          <button
            onClick={handlePrint}
            disabled={!isApproved}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              isApproved
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isApproved ? <Download size={16} /> : <Lock size={16} />}
            <span>Download / Print Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
