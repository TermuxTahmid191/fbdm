import React, { useState } from 'react';
import { 
  DollarSign, 
  History, 
  CreditCard, 
  FileText, 
  Share2, 
  Download, 
  Plus, 
  Heart, 
  AlertCircle,
  CheckCircle2,
  Clock,
  LoaderCircle,
  Copy,
  Check
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { MoneyDonation, User, AppSettings } from '../types';
import { initialAppSettings } from '../store';

interface DonationProps {
  donations: MoneyDonation[];
  user: User;
  onDonationCreated?: (donation: MoneyDonation) => void;
  appSettings?: AppSettings;
}

const DonationView: React.FC<DonationProps> = ({ donations, user, onDonationCreated, appSettings = initialAppSettings }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<MoneyDonation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'bKash',
    accountUsed: user.mobile || '',
    transactionId: '',
    note: ''
  });

  const handleCopyNumber = (num: string, label: string) => {
    const clean = num.replace(/\D/g, '');
    navigator.clipboard?.writeText(clean || num);
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const donDocRef = isFirebaseConfigured ? doc(collection(db, "donations")) : null;
    const donId = donDocRef ? donDocRef.id : `don_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newDonation: MoneyDonation = {
      id: donId,
      userId: user.id,
      userName: user.name,
      userMobile: user.mobile,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      accountUsed: formData.accountUsed.trim(),
      transactionId: formData.transactionId.trim(),
      date: new Date().toISOString(),
      note: formData.note.trim(),
      status: 'PENDING'
    };

    // Instant update
    onDonationCreated?.(newDonation);

    // Background Firestore write
    if (isFirebaseConfigured && donDocRef) {
      const savePromise = setDoc(donDocRef, newDonation);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
      Promise.race([savePromise, timeoutPromise]).catch(error => {
        console.warn("Error submitting donation to firestore:", error);
      });
    }

    setShowForm(false);
    setFormData({ 
      amount: '', 
      paymentMethod: 'bKash', 
      accountUsed: user.mobile || '', 
      transactionId: '', 
      note: '' 
    });
    setIsSubmitting(false);
  };

  const userDonations = donations.filter(d => d.userId === user.id);
  const verifiedTotal = userDonations
    .filter(d => d.status === 'VERIFIED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Financial Support</h2>
          <p className="text-xs text-slate-500">Help fund emergency patient blood bags and community awareness.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <DollarSign size={20} />
          </div>
          <div className="pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Your Verified Total</p>
            <p className="text-base font-black text-slate-800 mt-0.5">৳{verifiedTotal}</p>
          </div>
        </div>
      </header>

      {/* Official Payment Accounts Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            Official Donation Channels
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Support Blood Operations in Mymensingh
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Send money to any of our official numbers, then submit your transaction details below for verification and receive an official digital receipt.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {appSettings.bkashNumber && (
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider">
                    bKash ({appSettings.bkashType || 'Personal'})
                  </span>
                  <p className="text-sm font-black font-mono mt-0.5">{appSettings.bkashNumber}</p>
                </div>
                <button 
                  onClick={() => handleCopyNumber(appSettings.bkashNumber, 'bkash')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                  title="Copy bKash number"
                >
                  {copiedNumber === 'bkash' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            )}

            {appSettings.nagadNumber && (
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Nagad ({appSettings.nagadType || 'Personal'})
                  </span>
                  <p className="text-sm font-black font-mono mt-0.5">{appSettings.nagadNumber}</p>
                </div>
                <button 
                  onClick={() => handleCopyNumber(appSettings.nagadNumber, 'nagad')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                  title="Copy Nagad number"
                >
                  {copiedNumber === 'nagad' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            )}

            {appSettings.rocketNumber && (
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                    Rocket ({appSettings.rocketType || 'Personal'})
                  </span>
                  <p className="text-sm font-black font-mono mt-0.5">{appSettings.rocketNumber}</p>
                </div>
                <button 
                  onClick={() => handleCopyNumber(appSettings.rocketNumber, 'rocket')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                  title="Copy Rocket number"
                >
                  {copiedNumber === 'rocket' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            )}

            {appSettings.bankDetails && (
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">
                    Bank Account Details
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{appSettings.bankDetails}</p>
                </div>
                <button 
                  onClick={() => handleCopyNumber(appSettings.bankDetails, 'bank')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white flex-shrink-0"
                  title="Copy Bank details"
                >
                  {copiedNumber === 'bank' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-red-900/50 transition-all active:scale-98"
          >
            <Plus size={16} />
            <span>Submit Donation Details</span>
          </button>
        </div>
      </div>

      {/* History of Donations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <span>Your Contribution History</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">{userDonations.length} records</span>
        </div>

        {userDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userDonations.map(don => {
              const dateStr = don.date?.toDate 
                ? don.date.toDate().toLocaleDateString() 
                : (don.date ? new Date(don.date).toLocaleDateString() : 'Recent');

              return (
                <div key={don.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-xl text-emerald-600">৳{don.amount}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{don.paymentMethod} • {dateStr}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      don.status === 'VERIFIED'
                        ? 'bg-green-100 text-green-700'
                        : don.status === 'REJECTED'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {don.status === 'PENDING' ? 'Under Review' : don.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <p className="text-slate-600">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Txn ID: </span>
                      <span className="font-mono font-bold text-slate-800">{don.transactionId}</span>
                    </p>
                    {don.accountUsed && (
                      <p className="text-slate-600">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">From: </span>
                        <span>{don.accountUsed}</span>
                      </p>
                    )}
                  </div>

                  {don.status === 'VERIFIED' && (
                    <button
                      onClick={() => setSelectedReceipt(don)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileText size={14} className="text-red-500" />
                      <span>View Official Receipt</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400 p-6">
            <Heart size={40} className="mx-auto mb-2 opacity-20 text-slate-400" />
            <p className="text-xs font-semibold">No donations recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Submit your first contribution above to help keep FBDM running!</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto hide-scrollbar">
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              ✕
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-black text-slate-800">Submit Donation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter details of your transaction for admin verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Amount (BDT)
                </label>
                <input
                  required
                  type="number"
                  min="10"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-red-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-red-400"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Sender Mobile / Account Number
                </label>
                <input
                  required
                  type="text"
                  value={formData.accountUsed}
                  onChange={e => setFormData({ ...formData, accountUsed: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  required
                  type="text"
                  value={formData.transactionId}
                  onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="e.g. 9J87K6L5M"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-mono uppercase outline-none focus:bg-white focus:border-red-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Note / Message (Optional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="For patient fund / Zakat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    <span>Submitting Donation...</span>
                  </>
                ) : (
                  <span>Confirm Donation Submission</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedReceipt(null)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-3 shadow-md shadow-red-200">
                <Heart className="fill-white" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Donation Receipt</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                Official FBDM Mymensingh Certificate
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 space-y-3 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Donor</span>
                <span className="font-black text-slate-800">{selectedReceipt.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Amount</span>
                <span className="text-sm font-black text-emerald-600">৳{selectedReceipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
                <span className="font-bold text-slate-800">
                  {selectedReceipt.date?.toDate 
                    ? selectedReceipt.date.toDate().toLocaleDateString() 
                    : (selectedReceipt.date ? new Date(selectedReceipt.date).toLocaleDateString() : 'Verified')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Method</span>
                <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Txn ID</span>
                <span className="font-mono font-bold text-slate-800 break-all">{selectedReceipt.transactionId}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 italic">
                  Thank you for your generous contribution to Free Blood Donation Mymensingh.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={15} />
              <span>Print / Save Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationView;
