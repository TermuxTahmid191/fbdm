
import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  DollarSign, 
  CheckCircle, 
  Search, 
  MoreHorizontal, 
  ShieldAlert
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BloodRequest, MoneyDonation, User, UserRole } from '../types';

interface AdminProps {
  requests: BloodRequest[];
  donations: MoneyDonation[];
  donors: User[];
  currentUser: User;
  onRequestStatusChange?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onDonationStatusChange?: (id: string, status: 'VERIFIED' | 'REJECTED') => void;
}

type AdminSubTab = 'REQUESTS' | 'DONATIONS' | 'USERS';

const AdminDashboardView: React.FC<AdminProps> = ({ 
  requests, 
  donations, 
  donors, 
  currentUser,
  onRequestStatusChange,
  onDonationStatusChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('REQUESTS');

  // Role-based access control checks
  const canManageDonations = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN;
  const canManageUsers = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN;

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const pendingDonations = donations.filter(d => d.status === 'PENDING');

  const handleApproveRequest = async (id: string) => {
    try {
      const requestDocRef = doc(db, "requests", id);
      await updateDoc(requestDocRef, { status: 'APPROVED' });
    } catch (e) {
      console.warn("Firestore update error:", e);
    }
    onRequestStatusChange?.(id, 'APPROVED');
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const requestDocRef = doc(db, "requests", id);
      await updateDoc(requestDocRef, { status: 'REJECTED' });
    } catch (e) {
      console.warn("Firestore update error:", e);
    }
    onRequestStatusChange?.(id, 'REJECTED');
  };

  const handleApproveDonation = async (id: string) => {
    if (!canManageDonations) return;
    try {
      const donationDocRef = doc(db, "donations", id);
      await updateDoc(donationDocRef, { status: 'VERIFIED' });
    } catch (e) {
      console.warn("Firestore update error:", e);
    }
    onDonationStatusChange?.(id, 'VERIFIED');
  };

  const handleRejectDonation = async (id: string) => {
    if (!canManageDonations) return;
    try {
      const donationDocRef = doc(db, "donations", id);
      await updateDoc(donationDocRef, { status: 'REJECTED' });
    } catch (e) {
      console.warn("Firestore update error:", e);
    }
    onDonationStatusChange?.(id, 'REJECTED');
  };
  
  const handleTabClick = (tab: AdminSubTab) => {
    if (tab === 'DONATIONS' && !canManageDonations) return;
    if (tab === 'USERS' && !canManageUsers) return;
    setActiveSubTab(tab);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-800">Admin Console</h2>
        <p className="text-sm text-slate-500">Centralized control for FBDM community.</p>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Total Users" value={donors.length} subValue="Community members" icon={<Users className="text-blue-600" />} />
        <StatItem label="Pending Requests" value={pendingRequests.length} subValue="High Priority" icon={<Droplet className="text-red-600" />} />
        <StatItem label="Financial Support" value={`৳${donations.reduce((a,b) => a + (b.status === 'VERIFIED' ? b.amount : 0), 0)}`} subValue="Verified Total" icon={<DollarSign className="text-green-600" />} />
        <StatItem label="Reports" value="0" subValue="Unresolved" icon={<ShieldAlert className="text-amber-600" />} />
      </section>

      {/* Sub Navigation */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button onClick={() => handleTabClick('REQUESTS')} className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeSubTab === 'REQUESTS' ? 'text-red-600' : 'text-slate-400'}`}>
          Requests {pendingRequests.length > 0 && <span className="ml-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>}
          {activeSubTab === 'REQUESTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
        </button>
        {canManageDonations && (
          <button onClick={() => handleTabClick('DONATIONS')} className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeSubTab === 'DONATIONS' ? 'text-red-600' : 'text-slate-400'}`}>
            Donations {pendingDonations.length > 0 && <span className="ml-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingDonations.length}</span>}
            {activeSubTab === 'DONATIONS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}
        {canManageUsers && (
          <button onClick={() => handleTabClick('USERS')} className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeSubTab === 'USERS' ? 'text-red-600' : 'text-slate-400'}`}>
            Users
            {activeSubTab === 'USERS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeSubTab === 'REQUESTS' && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? pendingRequests.map(req => (
              <div key={req.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${req.isEmergency ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {req.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{req.patientName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{req.hospitalName} • {req.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveRequest(req.id)} className="flex-1 md:flex-none px-6 py-3 bg-green-100 text-green-600 rounded-2xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all">Approve</button>
                  <button onClick={() => handleRejectRequest(req.id)} className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all">Reject</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 bg-white rounded-[2.5rem] border border-slate-100">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                <p>No pending blood requests.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'DONATIONS' && canManageDonations && (
          <div className="space-y-4">
            {pendingDonations.length > 0 ? pendingDonations.map(don => (
              <div key={don.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-xl">৳{don.amount}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{don.paymentMethod} • {don.userName}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold">VERIFICATION NEEDED</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Txn ID</p>
                    <p className="text-xs font-mono font-bold text-slate-800">{don.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sender Account</p>
                    <p className="text-xs font-bold text-slate-800">{don.accountUsed}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveDonation(don.id)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm">Approve</button>
                  <button onClick={() => handleRejectDonation(don.id)} className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-sm">Reject</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 bg-white rounded-[2.5rem] border border-slate-100">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                <p>All donations are verified.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'USERS' && canManageUsers && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">Community Members</h4>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search user..." className="bg-slate-50 border-none rounded-full pl-10 pr-4 py-2 text-xs outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4">Upazila</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {donors.map(donor => (
                    <tr key={donor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">{donor.name.charAt(0)}</div>
                          <span className="text-sm font-bold text-slate-800">{donor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-bold text-red-600">{donor.bloodGroup}</span></td>
                      <td className="px-6 py-4"><span className="text-xs text-slate-500">{donor.upazila}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${donor.isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {donor.isApproved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><MoreHorizontal size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number, subValue: string, icon: React.ReactNode }> = ({ label, value, subValue, icon }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">{icon}</div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-800 leading-none mb-1">{value}</p>
    <p className="text-[10px] font-medium text-slate-400">{subValue}</p>
  </div>
);

export default AdminDashboardView;