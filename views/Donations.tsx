
import React, { useState } from 'react';
import { DollarSign, History, CreditCard, FileText, Share2, Download, Plus, Heart, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { MoneyDonation, User } from '../types';

interface DonationProps {
  donations: MoneyDonation[];
  user: User;
  onDonationCreated?: (donation: MoneyDonation) => void;
}

const DonationView: React.FC<DonationProps> = ({ donations, user, onDonationCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<MoneyDonation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'bKash',
    accountUsed: '',
    transactionId: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newDonation: MoneyDonation = {
      id: `don_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userMobile: user.mobile,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      accountUsed: formData.accountUsed,
      transactionId: formData.transactionId,
      date: { toDate: () => new Date() },
      note: formData.note,
      status: 'PENDING'
    };

    onDonationCreated?.(newDonation);

    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, "donations"), {
          userId: user.id,
          userName: user.name,
          userMobile: user.mobile,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          accountUsed: formData.accountUsed,
          transactionId: formData.transactionId,
          date: serverTimestamp(),
          note: formData.note,
          status: 'PENDING'
        });
      } catch (error) {
        console.warn("Error submitting donation to firestore:", error);
      }
    }

    setShowForm(false);
    setFormData({ amount: '', paymentMethod: 'bKash', accountUsed: '', transactionId: '', note: '' });
    setIsSubmitting(false);
  };


  const userDonations = donations.filter(d => d.userId === user.id);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">Financial Support</h2>
          <p className="text-sm text-slate-500">Help fund blood drives and save more lives.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <DollarSign size={20} />
          </div>
          <div className="pr-2">
            <p className="text-[10px] font-bold text-slate-400 leading-none">Your Total</p>
            <p className="text-sm font-black text-slate-800">৳{userDonations.filter(d => d.status === 'VERIFIED').reduce((acc, curr) => acc + curr.amount, 0)}</p>
          </div>
        </div>
      </header>

      {/* Main Stats Card */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black">Support FBDM</h3>
            <p className="text-slate-400 text-sm max-w-sm">Your contributions help us manage medical supplies, logistics, and organizing community drives.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/50 flex items-center justify-center gap-2"
          >
            <DollarSign size={24} /> Donate Now
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </section>

      {/* History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-red-500" />
            Donation History
          </h3>
        </div>
        
        {userDonations.length > 0 ? (
          userDonations.map(donation => (
            <div key={donation.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${donation.status === 'VERIFIED' ? 'bg-green-50 text-green-600' : donation.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">৳{donation.amount}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{donation.paymentMethod}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {donation.date?.toDate 
                      ? donation.date.toDate().toLocaleDateString() 
                      : (donation.date ? new Date(donation.date).toLocaleDateString() : 'Recent')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${donation.status === 'VERIFIED' ? 'bg-green-100 text-green-600' : donation.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {donation.status}
                </div>
                {donation.status === 'VERIFIED' && (
                  <button onClick={() => setSelectedReceipt(donation)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <FileText size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <p className="text-sm">No donations recorded yet.</p>
          </div>
        )}
      </section>

      {/* Donation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <button onClick={() => setShowForm(false)} className="absolute right-8 top-8 text-slate-400">
              <Plus size={24} className="rotate-45" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Money Donation</h3>
            <p className="text-sm text-slate-500 mb-8">Your contribution supports our free service.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount (৳)</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Method</label>
                  <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100">
                    <option>bKash</option>
                    <option>Nagad</option>
                    <option>Rocket</option>
                    <option>Upay</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Account No.</label>
                <input required type="text" value={formData.accountUsed} onChange={e => setFormData({...formData, accountUsed: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="The number you sent from" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction ID</label>
                <input required type="text" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-red-100" placeholder="e.g. 8A76XB49" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" rows={2} placeholder="Any message for us?"></textarea>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertCircle size={14} className="mt-0.5" />
                  <span>Send money to our official number first, then submit this form with Transaction ID.</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-400">Official bKash:</span>
                  <span className="text-sm font-black text-slate-800">017XXXXXXXX</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-100 hover:bg-red-700 transition-all disabled:bg-red-400">
                {isSubmitting ? 'Submitting...' : 'Submit Donation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedReceipt(null)} className="absolute right-8 top-8 text-slate-400">
              <Plus size={24} className="rotate-45" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 rotate-3">
                <Heart className="fill-white" size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Donation Receipt</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Official Document</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Donor</span>
                <span className="text-xs font-black text-slate-800">{selectedReceipt.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Amount</span>
                <span className="text-sm font-black text-red-600">৳{selectedReceipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Date</span>
                <span className="text-xs font-black text-slate-800">{selectedReceipt.date?.toDate().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Txn ID</span>
                <span className="text-xs font-black text-slate-800 font-mono">{selectedReceipt.transactionId}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-medium italic">Thank you for your generous contribution to FBDM Mymensingh.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                <Download size={14} /> Download
              </button>
              <button className="flex items-center justify-center gap-2 bg-white text-slate-900 border-2 border-slate-100 py-3 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all">
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationView;