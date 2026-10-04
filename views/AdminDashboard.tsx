import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  DollarSign, 
  CheckCircle, 
  Search, 
  ShieldAlert,
  BarChart3,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Phone,
  MapPin,
  RefreshCw,
  Settings,
  Lock,
  Plus,
  Save,
  AlertTriangle,
  CreditCard,
  Building,
  Radio,
  UserPlus,
  Edit3,
  Calendar,
  Megaphone,
  Heart,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
  FileText
} from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { 
  BloodRequest, 
  MoneyDonation, 
  User, 
  UserRole, 
  AppSettings, 
  EmergencyContact,
  Notice,
  DonationEvent,
  BloodGroup
} from '../types';
import AdminReportModal from '../components/AdminReportModal';
import { initialAppSettings, verifyAdminPassword, checkDonationEligibility, adminUser } from '../store';

interface AdminProps {
  requests: BloodRequest[];
  donations: MoneyDonation[];
  donors: User[];
  currentUser: User;
  notices?: Notice[];
  events?: DonationEvent[];
  onRequestStatusChange?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onDonationStatusChange?: (id: string, status: 'VERIFIED' | 'REJECTED') => void;
  onUserStatusChange?: (id: string, updates: Partial<User>) => void;
  onDeleteRequest?: (id: string) => void;
  onDeleteDonation?: (id: string) => void;
  onOpenAnalysis?: () => void;
  appSettings?: AppSettings;
  onUpdateAppSettings?: (newSettings: AppSettings) => void;
  onAddNewAdmin?: (newAdmin: { name: string; email: string; mobile: string; password: string; role: UserRole }) => void;
  onSaveNotice?: (notice: Notice) => void;
  onDeleteNotice?: (id: string) => void;
  onSaveEvent?: (event: DonationEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateUser?: (updated: User) => void;
}

type AdminSubTab = 'REQUESTS' | 'DONATIONS' | 'USERS' | 'NOTICES_EVENTS' | 'SETTINGS';
type RequestFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type DonationFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';
type UserFilter = 'ALL' | 'APPROVED' | 'PENDING';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const AdminDashboardView: React.FC<AdminProps> = ({ 
  requests, 
  donations, 
  donors, 
  currentUser,
  notices = [],
  events = [],
  onRequestStatusChange,
  onDonationStatusChange,
  onUserStatusChange,
  onDeleteRequest,
  onDeleteDonation,
  onOpenAnalysis,
  appSettings = initialAppSettings,
  onUpdateAppSettings,
  onAddNewAdmin,
  onSaveNotice,
  onDeleteNotice,
  onSaveEvent,
  onDeleteEvent,
  onUpdateUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('REQUESTS');
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<AppSettings>(() => appSettings);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNote, setNewContactNote] = useState('');

  // Add Admin State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminMobile, setNewAdminMobile] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<UserRole>(UserRole.ADMIN);

  // Admin Password Verification Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'SAVE_SETTINGS' | 'CREATE_ADMIN' | null>(null);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Notice & Event Edit Modal States
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DonationEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Filters & Search
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('PENDING');
  const [requestSearch, setRequestSearch] = useState('');

  const [donationFilter, setDonationFilter] = useState<DonationFilter>('PENDING');
  const [donationSearch, setDonationSearch] = useState('');

  const [userFilter, setUserFilter] = useState<UserFilter>('ALL');
  const [userSearch, setUserSearch] = useState('');

  const canManageDonations = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN;
  const canManageUsers = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN;

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  const pendingDonations = donations.filter(d => d.status === 'PENDING');
  const verifiedDonations = donations.filter(d => d.status === 'VERIFIED');
  const rejectedDonations = donations.filter(d => d.status === 'REJECTED');

  const pendingDonors = donors.filter(u => !u.isApproved);
  const approvedDonors = donors.filter(u => u.isApproved);

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // 1. Blood Request Actions
  const handleApproveRequest = async (id: string) => {
    onRequestStatusChange?.(id, 'APPROVED');
    showNotification('✅ Blood Request Approved! It is now live to all donors.');
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "requests", id), { 
          status: 'APPROVED', 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore update error:", e);
      }
    }
  };

  const handleRejectRequest = async (id: string) => {
    onRequestStatusChange?.(id, 'REJECTED');
    showNotification('❌ Blood Request marked as Rejected.');
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "requests", id), { 
          status: 'REJECTED', 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore update error:", e);
      }
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blood request?')) return;
    onDeleteRequest?.(id);
    showNotification('🗑️ Blood request deleted.');
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "requests", id));
      } catch (e) {
        console.warn("Firestore delete request error:", e);
      }
    }
  };

  // 2. Financial Donation Actions
  const handleApproveDonation = async (id: string) => {
    if (!canManageDonations) return;
    onDonationStatusChange?.(id, 'VERIFIED');
    showNotification('✅ Financial Donation verified & added to total funds.');
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "donations", id), { 
          status: 'VERIFIED', 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore update donation error:", e);
      }
    }
  };

  const handleRejectDonation = async (id: string) => {
    if (!canManageDonations) return;
    onDonationStatusChange?.(id, 'REJECTED');
    showNotification('❌ Donation record marked as Rejected.');
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "donations", id), { 
          status: 'REJECTED', 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore reject donation error:", e);
      }
    }
  };

  // 3. User Community Management Actions
  const handleToggleUserApproval = async (user: User) => {
    const newStatus = !user.isApproved;
    onUserStatusChange?.(user.id, { isApproved: newStatus });
    showNotification(newStatus ? `✅ User "${user.name}" Approved.` : `⏸️ User "${user.name}" Suspended.`);
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", user.id), { 
          isApproved: newStatus,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore update user error:", e);
      }
    }
  };

  const handleToggleUserRole = async (user: User) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    onUserStatusChange?.(user.id, { role: newRole });
    showNotification(`🛡️ Role for "${user.name}" changed to ${newRole}.`);
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", user.id), { 
          role: newRole,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore update role error:", e);
      }
    }
  };

  // Save User Edit (Including Last Donation Date, Donations Count, Availability)
  const handleSaveUserEdit = async (updated: User) => {
    // Medical availability check: if last donation date is within 90 days, donor cannot be available
    let finalAvailable = updated.isAvailable;
    if (updated.lastDonationDate) {
      const eligibility = checkDonationEligibility(updated.lastDonationDate, updated.isAvailable);
      if (!eligibility.isEligible) {
        finalAvailable = false;
      }
    }

    const finalUser: User = {
      ...updated,
      donationsCount: Math.max(0, Number(updated.donationsCount) || 0),
      isAvailable: finalAvailable
    };

    onUpdateUser?.(finalUser);
    onUserStatusChange?.(finalUser.id, finalUser);

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", finalUser.id), finalUser, { merge: true });
      } catch (e) {
        console.warn("Firestore user edit error:", e);
      }
    }

    setEditingUser(null);
    showNotification(`✅ ডোনার "${finalUser.name}" এর তথ্য সফলভাবে আপডেট হয়েছে! ডাটাবেজ ও লিডারবোর্ডে সংরক্ষিত হয়েছে।`);
  };

  // 4. Notice Actions
  const handleSaveNoticeSubmit = async (notice: Notice) => {
    onSaveNotice?.(notice);
    setIsNoticeModalOpen(false);
    setEditingNotice(null);
    showNotification(`✅ নোটিশ "${notice.title}" সংরক্ষিত হয়েছে এবং অ্যাপে দৃশ্যমান।`);
  };

  const handleDeleteNoticeClick = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;
    onDeleteNotice?.(id);
    showNotification('🗑️ নোটিশটি মুছে ফেলা হয়েছে।');
  };

  // 5. Event Actions
  const handleSaveEventSubmit = async (event: DonationEvent) => {
    onSaveEvent?.(event);
    setIsEventModalOpen(false);
    setEditingEvent(null);
    showNotification(`✅ রক্তদান ইভেন্ট "${event.title}" সংরক্ষিত হয়েছে।`);
  };

  const handleDeleteEventClick = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?')) return;
    onDeleteEvent?.(id);
    showNotification('🗑️ রক্তদান ইভেন্ট মুছে ফেলা হয়েছে।');
  };

  // 6. Admin Settings & Password Verification Handlers
  const handleConfirmPasswordAction = async () => {
    if (!adminPasswordInput || !adminPasswordInput.trim()) {
      setPasswordError('অনুগ্রহ করে এডমিন পাসওয়ার্ড লিখুন।');
      return;
    }

    const isValid = verifyAdminPassword(adminPasswordInput, currentUser);
    if (!isValid) {
      setPasswordError('ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে নিশ্চিত করুন।');
      return;
    }

    if (pendingAction === 'SAVE_SETTINGS') {
      const updatedSettings: AppSettings = {
        ...settingsForm,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name || 'Admin'
      };

      onUpdateAppSettings?.(updatedSettings);
      try {
        localStorage.setItem('fbdm_app_settings', JSON.stringify(updatedSettings));
      } catch (e) {}

      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, "settings", "global_app_settings"), updatedSettings, { merge: true });
        } catch (e) {
          console.warn("Firestore save settings error:", e);
        }
      }

      setIsPasswordModalOpen(false);
      setAdminPasswordInput('');
      setPasswordError(null);
      setPendingAction(null);
      showNotification('✅ সেটিংস সফলভাবে সংরক্ষিত হয়েছে! অ্যাপের তথ্য ও ডোনেশন নাম্বার আপডেট করা হয়েছে।');
    } else if (pendingAction === 'CREATE_ADMIN') {
      const newAdmin: User = {
        id: `admin_${Date.now()}`,
        name: newAdminName.trim(),
        role: newAdminRole,
        bloodGroup: 'O+',
        division: 'Mymensingh',
        district: 'Mymensingh',
        upazila: 'Sadar',
        address: 'Mymensingh Sadar',
        mobile: newAdminMobile.trim(),
        whatsapp: newAdminMobile.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        lastDonationDate: null,
        isAvailable: true,
        isApproved: true,
        donationsCount: 0
      };

      onAddNewAdmin?.({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        mobile: newAdminMobile.trim(),
        password: newAdminPassword.trim(),
        role: newAdminRole
      });

      // Also persist to localStorage accounts and users
      try {
        const localAccounts = JSON.parse(localStorage.getItem('fbdm_registered_accounts') || '[]');
        localAccounts.push({ user: newAdmin, password: newAdminPassword.trim() });
        localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));

        const localUsers = JSON.parse(localStorage.getItem('fbdm_registered_users') || '[]');
        localUsers.push(newAdmin);
        localStorage.setItem('fbdm_registered_users', JSON.stringify(localUsers));
      } catch (e) {}

      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, "users", newAdmin.id), newAdmin);
        } catch (e) {
          console.warn("Firestore save new admin error:", e);
        }
      }

      setIsPasswordModalOpen(false);
      setAdminPasswordInput('');
      setPasswordError(null);
      setPendingAction(null);

      // Reset fields
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminMobile('');
      setNewAdminPassword('');
      setNewAdminRole(UserRole.ADMIN);

      showNotification(`✅ নতুন এডমিন "${newAdmin.name}" সফলভাবে যুক্ত হয়েছে!`);
    }
  };

  // Filtered Lists
  const filteredRequests = requests.filter(req => {
    if (requestFilter !== 'ALL' && req.status !== requestFilter) return false;
    if (requestSearch) {
      const query = requestSearch.toLowerCase();
      return (
        req.patientName?.toLowerCase().includes(query) ||
        req.hospitalName?.toLowerCase().includes(query) ||
        req.bloodGroup?.toLowerCase().includes(query) ||
        req.contactNumber?.includes(query)
      );
    }
    return true;
  });

  const filteredDonations = donations.filter(don => {
    if (donationFilter !== 'ALL' && don.status !== donationFilter) return false;
    if (donationSearch) {
      const query = donationSearch.toLowerCase();
      return (
        don.userName?.toLowerCase().includes(query) ||
        don.transactionId?.toLowerCase().includes(query) ||
        don.userMobile?.includes(query)
      );
    }
    return true;
  });

  const filteredUsers = donors.filter(u => {
    if (userFilter === 'APPROVED' && !u.isApproved) return false;
    if (userFilter === 'PENDING' && u.isApproved) return false;
    if (userSearch) {
      const query = userSearch.toLowerCase();
      return (
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.mobile?.includes(query) ||
        u.bloodGroup?.toLowerCase().includes(query) ||
        u.upazila?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-md">
              Admin Portal
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Control Console</h2>
          <p className="text-xs text-slate-500">Real-time management for FBDM Mymensingh operations & app data</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer size={15} className="text-amber-400" />
            <span>Download Report (PDF/CSV)</span>
          </button>
          {onOpenAnalysis && (
            <button
              onClick={onOpenAnalysis}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <BarChart3 size={15} />
              <span>Analysis</span>
            </button>
          )}
        </div>
      </header>

      {/* Action Toast / Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 bg-slate-900 text-white text-xs font-bold rounded-2xl flex items-center justify-between shadow-lg shadow-slate-200 animate-in fade-in slide-in-from-top-2">
          <span>{actionFeedback}</span>
          <button 
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem 
          label="Total Donors" 
          value={donors.length} 
          subValue={`${approvedDonors.length} active`} 
          icon={<Users className="text-blue-600" size={20} />} 
        />
        <StatItem 
          label="Pending Blood" 
          value={pendingRequests.length} 
          subValue={`${approvedRequests.length} approved`} 
          icon={<Droplet className="text-red-600" size={20} />} 
        />
        <StatItem 
          label="Verified Funds" 
          value={`৳${verifiedDonations.reduce((a, b) => a + b.amount, 0)}`} 
          subValue={`${pendingDonations.length} pending`} 
          icon={<DollarSign className="text-green-600" size={20} />} 
        />
        <StatItem 
          label="System Status" 
          value="100% Online" 
          subValue="Firestore Real-time" 
          icon={<ShieldCheck className="text-emerald-600" size={20} />} 
        />
      </section>

      {/* Primary Sub Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveSubTab('REQUESTS')} 
          className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'REQUESTS' ? 'text-red-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>Blood Requests</span>
          {pendingRequests.length > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
          {activeSubTab === 'REQUESTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
        </button>

        {canManageDonations && (
          <button 
            onClick={() => setActiveSubTab('DONATIONS')} 
            className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'DONATIONS' ? 'text-red-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Donations (তহবিল)</span>
            {pendingDonations.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingDonations.length}
              </span>
            )}
            {activeSubTab === 'DONATIONS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}

        {canManageUsers && (
          <button 
            onClick={() => setActiveSubTab('USERS')} 
            className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'USERS' ? 'text-red-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Users size={15} />
            <span>ডোনার ও ইউজার ({donors.length})</span>
            {pendingDonors.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingDonors.length}
              </span>
            )}
            {activeSubTab === 'USERS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}

        {canManageUsers && (
          <button 
            onClick={() => setActiveSubTab('NOTICES_EVENTS')} 
            className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'NOTICES_EVENTS' ? 'text-red-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Megaphone size={15} />
            <span>নোটিশ ও ইভেন্ট ({notices.length + events.length})</span>
            {activeSubTab === 'NOTICES_EVENTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}

        {canManageUsers && (
          <button 
            onClick={() => setActiveSubTab('SETTINGS')} 
            className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'SETTINGS' ? 'text-red-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Settings size={15} />
            <span>অ্যাপ তথ্য ও সেটিংস A to Z</span>
            {activeSubTab === 'SETTINGS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"></div>}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">

        {/* 1. BLOOD REQUESTS TAB */}
        {activeSubTab === 'REQUESTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setRequestFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    requestFilter === 'PENDING'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    requestFilter === 'APPROVED'
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    requestFilter === 'REJECTED'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    requestFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({requests.length})
                </button>
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, hospital, group..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-red-400"
                />
              </div>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-lg flex-shrink-0">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{req.patientName}</h4>
                          <p className="text-xs text-slate-500 font-medium">{req.hospitalName}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                        <p className="font-bold text-slate-700 truncate">{req.location}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Required Time</span>
                        <p className="font-bold text-slate-700 truncate">{req.requiredAt}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Units</span>
                        <p className="font-bold text-red-600">{req.units} Bag(s)</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Contact</span>
                        <p className="font-mono font-bold text-slate-800">{req.contactNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve & Broadcast</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-bold transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {req.status === 'APPROVED' && (
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-bold transition-all"
                        >
                          Revoke / Reject
                        </button>
                      )}

                      {req.status === 'REJECTED' && (
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <RefreshCw size={13} />
                          <span>Re-Approve</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-100">
                <CheckCircle size={44} className="mx-auto mb-3 opacity-20 text-slate-400" />
                <p className="text-sm font-semibold">No requests matching this filter.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. DONATIONS TAB */}
        {activeSubTab === 'DONATIONS' && canManageDonations && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setDonationFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    donationFilter === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending ({pendingDonations.length})
                </button>
                <button
                  onClick={() => setDonationFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    donationFilter === 'VERIFIED'
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Verified ({verifiedDonations.length})
                </button>
                <button
                  onClick={() => setDonationFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    donationFilter === 'REJECTED'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rejected ({rejectedDonations.length})
                </button>
                <button
                  onClick={() => setDonationFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    donationFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({donations.length})
                </button>
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Txn ID, donor..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-red-400"
                />
              </div>
            </div>

            {filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDonations.map(don => (
                  <div key={don.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                          {don.paymentMethod}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">৳{don.amount}</h4>
                        <p className="text-xs text-slate-500 font-bold">{don.userName} ({don.userMobile})</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        don.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        don.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {don.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-2xl text-xs space-y-1 font-mono">
                      <p className="text-slate-500 text-[11px]">
                        Txn ID: <span className="font-bold text-slate-900 select-all">{don.transactionId}</span>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Sender Account: <span className="font-bold text-slate-700">{don.accountUsed || 'N/A'}</span>
                      </p>
                    </div>

                    {don.note && (
                      <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-xl">
                        "{don.note}"
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      {don.status !== 'VERIFIED' && (
                        <button 
                          onClick={() => handleApproveDonation(don.id)} 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={15} />
                          <span>Verify & Approve</span>
                        </button>
                      )}
                      {don.status !== 'REJECTED' && (
                        <button 
                          onClick={() => handleRejectDonation(don.id)} 
                          className="flex-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <XCircle size={15} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-100">
                <CheckCircle size={44} className="mx-auto mb-3 opacity-20 text-slate-400" />
                <p className="text-sm font-semibold">No donations matching this filter.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. COMMUNITY MEMBERS (USERS) TAB - WITH DIRECT EDIT BUTTONS */}
        {activeSubTab === 'USERS' && canManageUsers && (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs space-y-4">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">ডোনার ও ইউজার ডাটাবেজ</h3>
                <p className="text-xs text-slate-500">প্রতিটি ডোনারের সাথে [Edit বাটন] রয়েছে। লাস্ট ডোনেট ডেট, রক্তদানের সংখ্যা ও তথ্য পরিবর্তন সরাসরি সেভ হয়।</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                  <button
                    onClick={() => setUserFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      userFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({donors.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('APPROVED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      userFilter === 'APPROVED'
                        ? 'bg-green-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Approved ({approvedDonors.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      userFilter === 'PENDING'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Pending ({pendingDonors.length})
                  </button>
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="নাম, মোবাইল, গ্রুপ..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-48 sm:w-56 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-red-400" 
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Blood</th>
                    <th className="px-5 py-3.5">Mobile</th>
                    <th className="px-5 py-3.5">সর্বশেষ রক্তদান</th>
                    <th className="px-5 py-3.5">ডোনেশন সংখ্যা</th>
                    <th className="px-5 py-3.5">প্রাপ্যতা (Availability)</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(donor => {
                    const eligibility = checkDonationEligibility(donor.lastDonationDate, donor.isAvailable);

                    return (
                      <tr key={donor.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              {donor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{donor.name}</p>
                              <p className="text-[10px] text-slate-400">{donor.email || donor.upazila}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-red-600">{donor.bloodGroup}</td>
                        <td className="px-5 py-3.5 text-slate-700 font-mono font-medium">{donor.mobile}</td>
                        
                        {/* Last Donation Date */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-slate-700 font-bold">
                            {donor.lastDonationDate || 'পূর্বে রক্ত দেননি'}
                          </span>
                        </td>

                        {/* Total Donations Count */}
                        <td className="px-5 py-3.5">
                          <span className="font-extrabold text-slate-900 bg-red-50 text-red-700 px-2 py-0.5 rounded-md">
                            {donor.donationsCount || 0} বার
                          </span>
                        </td>

                        {/* Availability / Resting Status */}
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${eligibility.statusBadge.colorClass} inline-flex items-center gap-1`}>
                            {eligibility.effectiveAvailability ? (
                              <CheckCircle size={10} className="text-emerald-600" />
                            ) : (
                              <Clock size={10} className="text-amber-600" />
                            )}
                            <span>{eligibility.statusBadge.text}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            donor.role === UserRole.ADMIN || donor.role === UserRole.MAIN_ADMIN
                              ? 'bg-slate-900 text-amber-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {donor.role}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* DIRECT EDIT BUTTON FOR USER */}
                            <button
                              onClick={() => setEditingUser({ ...donor })}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs"
                              title="ইউজারের তথ্য ও রক্তদানের ইতিহাস সংশোধন করুন"
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserApproval(donor)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                donor.isApproved 
                                  ? 'bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={donor.isApproved ? 'Suspend Member' : 'Approve Member'}
                            >
                              {donor.isApproved ? 'Suspend' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleToggleUserRole(donor)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
                              title="Toggle Admin Role"
                            >
                              {donor.role === UserRole.ADMIN ? 'User' : 'Admin'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. NOTICES & EVENTS SUBTAB - FULL EDIT & MANAGEMENT */}
        {activeSubTab === 'NOTICES_EVENTS' && canManageUsers && (
          <div className="space-y-6">
            {/* Notices Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">নোটিশ বোর্ড নিয়ন্ত্রণ (Notices Management)</h3>
                    <p className="text-xs text-slate-400">অ্যাপের নোটিশ বোর্ডে সরাসরি প্রদর্শিত নোটিশ সমূহ। প্রতি নোটিশে Edit বাটন রয়েছে।</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    setEditingNotice({
                      id: `notice_${Date.now()}`,
                      title: '',
                      content: '',
                      date: todayStr,
                      priority: 'NORMAL'
                    });
                    setIsNoticeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>নতুন নোটিশ যোগ করুন (Add Notice)</span>
                </button>
              </div>

              {notices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {notices.map(notice => (
                    <div key={notice.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              notice.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {notice.priority} PRIORITY
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar size={11} /> {notice.date}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-slate-900">{notice.title}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => {
                              setEditingNotice({ ...notice });
                              setIsNoticeModalOpen(true);
                            }}
                            className="p-1.5 bg-white text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 shadow-2xs hover:bg-red-50 transition-colors"
                            title="সম্পাদনা করুন (Edit)"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteNoticeClick(notice.id)}
                            className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 shadow-2xs hover:bg-red-50 transition-colors"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {notice.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400">
                  <p className="text-xs">কোনো নোটিশ নেই। উপরে বাটন দিয়ে নতুন নোটিশ যোগ করুন।</p>
                </div>
              )}
            </div>

            {/* Donation Events & Campaigns Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">রক্তদান ক্যাম্পেইন ও ইভেন্ট (Events Management)</h3>
                    <p className="text-xs text-slate-400">হোম পেজে প্রদর্শিত ক্যাম্পেইনের বিবরণ ও তারিখ সম্পাদনা করুন।</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingEvent({
                      id: `event_${Date.now()}`,
                      title: '',
                      date: '',
                      location: '',
                      contactPerson: '',
                      interestedCount: 0
                    });
                    setIsEventModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>নতুন ইভেন্ট যোগ করুন (Add Event)</span>
                </button>
              </div>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {events.map(event => (
                    <div key={event.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{event.title}</h4>
                          <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {event.date}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingEvent({ ...event });
                              setIsEventModalOpen(true);
                            }}
                            className="p-1.5 bg-white text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 shadow-2xs hover:bg-red-50 transition-colors"
                            title="সম্পাদনা করুন (Edit)"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEventClick(event.id)}
                            className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 shadow-2xs hover:bg-red-50 transition-colors"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                        <p className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {event.location}</p>
                        <p className="text-slate-500">Contact: <span className="font-semibold text-slate-700">{event.contactPerson}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400">
                  <p className="text-xs">কোনো রক্তদান ক্যাম্পেইন নেই।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SETTINGS & APP CONFIGURATION TAB (A TO Z EDITABLE) */}
        {activeSubTab === 'SETTINGS' && canManageUsers && (
          <div className="space-y-6">
            {/* Settings Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                    Admin Configuration
                  </span>
                  <span className="text-xs text-slate-500 font-medium">কোড পরিবর্তন ছাড়া সম্পূর্ণ তথ্য ও টেক্সট নিয়ন্ত্রণ</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">App Texts, Content & Donation Settings A to Z</h3>
                <p className="text-xs text-slate-500">
                  হোম স্ক্রিন, স্লোগান, ডোনেশন নাম্বার, সংস্থার হটলাইন, ব্যানার নোটিশ ও নতুন এডমিন এখান থেকেই পরিবর্তন করুন। পরিবর্তনের জন্য এডমিন পাসওয়ার্ড আবশ্যক।
                </p>
              </div>

              <button
                onClick={() => {
                  setPasswordError(null);
                  setAdminPasswordInput('');
                  setPendingAction('SAVE_SETTINGS');
                  setIsPasswordModalOpen(true);
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save All Settings (সেভ করুন)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Hero Section Texts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">হোম পেজ ব্যানার ও টেক্সট (Hero Banner Texts)</h4>
                      <p className="text-[11px] text-slate-400">হোম স্ক্রিনের মূল টাইটেল ও সাবটাইটেল</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Editable</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মূল টাইটেল (Hero Main Title)
                    </label>
                    <input 
                      type="text" 
                      value={settingsForm.heroTitle || ''} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white focus:border-red-500" 
                      placeholder="Be a Hero, Save Lives."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      সাবটাইটেল / বিবরণ (Hero Subtitle / Description)
                    </label>
                    <textarea 
                      rows={3} 
                      value={settingsForm.heroSubtitle || ''} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-medium" 
                      placeholder="স্বেচ্ছায় রক্তদান করুন, জীবন বাঁচান..."
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Official Donation Payment Accounts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">ডোনেশন একাউন্ট ও নাম্বার (Financial Accounts)</h4>
                      <p className="text-[11px] text-slate-400">ইউজার অ্যাপের ডোনেশন পাতায় এই নাম্বার প্রদর্শিত হবে</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">Editable</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* bKash */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">bKash Number</label>
                      <input 
                        type="text" 
                        value={settingsForm.bkashNumber} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:bg-white focus:border-red-500" 
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                      <select 
                        value={settingsForm.bkashType} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, bkashType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-semibold"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Merchant">Merchant</option>
                        <option value="Agent">Agent</option>
                      </select>
                    </div>
                  </div>

                  {/* Nagad */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nagad Number</label>
                      <input 
                        type="text" 
                        value={settingsForm.nagadNumber} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:bg-white focus:border-red-500" 
                        placeholder="018XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                      <select 
                        value={settingsForm.nagadType} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, nagadType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-semibold"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Merchant">Merchant</option>
                        <option value="Agent">Agent</option>
                      </select>
                    </div>
                  </div>

                  {/* Rocket */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Rocket Number</label>
                      <input 
                        type="text" 
                        value={settingsForm.rocketNumber} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:bg-white focus:border-red-500" 
                        placeholder="019XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                      <select 
                        value={settingsForm.rocketType} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, rocketType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-semibold"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Merchant">Merchant</option>
                        <option value="Agent">Agent</option>
                      </select>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Account Information</label>
                    <textarea 
                      rows={2} 
                      value={settingsForm.bankDetails} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:bg-white focus:border-red-500" 
                      placeholder="Bank Name, Branch, Account Name & Number"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Organization Info & Contact Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">সংস্থার তথ্য ও যোগাযোগ (Organization Details)</h4>
                      <p className="text-[11px] text-slate-400">অ্যাপের শিরোনাম, ঠিকানা ও ২৪/৭ জরুরি হটলাইন</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Editable</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">সংস্থার নাম (Organization Name)</label>
                    <input 
                      type="text" 
                      value={settingsForm.orgName} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, orgName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">স্লোগান / ট্যাগলাইন (Tagline)</label>
                    <input 
                      type="text" 
                      value={settingsForm.tagline} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">জরুরি হটলাইন (24/7 Hotline)</label>
                      <input 
                        type="text" 
                        value={settingsForm.emergencyHotline} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, emergencyHotline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-600 outline-none focus:bg-white focus:border-red-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল (Official Email)</label>
                      <input 
                        type="email" 
                        value={settingsForm.officialEmail} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, officialEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Group URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.facebookGroupUrl} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookGroupUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-600 outline-none focus:bg-white focus:border-red-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.facebookPageUrl || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookPageUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-600 outline-none focus:bg-white focus:border-red-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">অফিস ঠিকানা (Office Address)</label>
                    <input 
                      type="text" 
                      value={settingsForm.officeAddress} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, officeAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Emergency Banner Notice */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Radio size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">জরুরী লাইভ ব্যানার নোটিশ (Broadcast Banner)</h4>
                      <p className="text-[11px] text-slate-400">হোম স্ক্রিনে সবার উপরে চলমান ব্যানার নোটিশ</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Live Banner</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="showBannerCheck"
                      checked={settingsForm.showBannerNotice} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, showBannerNotice: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded cursor-pointer"
                    />
                    <label htmlFor="showBannerCheck" className="font-bold text-slate-800 cursor-pointer">
                      ব্যানার নোটিশ চালু রাখুন (Show Active Banner Notice)
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">নোটিশের বিষয়বস্তু (Banner Text)</label>
                    <textarea 
                      rows={3}
                      value={settingsForm.activeBannerNotice}
                      onChange={(e) => setSettingsForm({ ...settingsForm, activeBannerNotice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-medium"
                      placeholder="জরুরী রক্তের প্রয়োজনে আমাদের হটলাইনে যোগাযোগ করুন..."
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Dynamic Emergency Contacts Directory with Edit Buttons */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">জরুরী কন্টাক্ট ডিরেক্টরি (Emergency Contacts)</h4>
                      <p className="text-[11px] text-slate-400">ব্লাড ব্যাংক, এম্বুলেন্স ও জরুরি সেবা নাম্বার</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Directory</span>
                </div>

                <div className="space-y-3">
                  {/* Current Contacts List */}
                  <div className="space-y-2">
                    {settingsForm.emergencyContacts?.map((contact) => (
                      <div key={contact.id} className="bg-slate-50 p-2.5 rounded-2xl flex items-center justify-between text-xs border border-slate-100">
                        <div>
                          <p className="font-extrabold text-slate-900">{contact.name}</p>
                          <p className="text-red-600 font-mono font-bold text-[11px]">{contact.phone} <span className="text-slate-400 font-normal">({contact.note})</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              const newName = window.prompt("সেবার নাম সম্পাদন করুন:", contact.name);
                              if (newName === null) return;
                              const newPhone = window.prompt("ফোন নাম্বার:", contact.phone);
                              if (newPhone === null) return;
                              const newNote = window.prompt("মন্তব্য:", contact.note || '');
                              if (newNote === null) return;
                              setSettingsForm({
                                ...settingsForm,
                                emergencyContacts: settingsForm.emergencyContacts.map(c => 
                                  c.id === contact.id ? { ...c, name: newName.trim() || c.name, phone: newPhone.trim() || c.phone, note: newNote.trim() } : c
                                )
                              });
                            }}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              setSettingsForm({
                                ...settingsForm,
                                emergencyContacts: settingsForm.emergencyContacts.filter(c => c.id !== contact.id)
                              });
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Contact Row */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="সেবার নাম (e.g. MMCH Blood Bank)" 
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:bg-white"
                    />
                    <input 
                      type="text" 
                      placeholder="ফোন নাম্বার (017...)" 
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:bg-white font-mono"
                    />
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="মন্তব্য (24/7)" 
                        value={newContactNote}
                        onChange={(e) => setNewContactNote(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:bg-white"
                      />
                      <button 
                        onClick={() => {
                          if (!newContactName.trim() || !newContactPhone.trim()) return;
                          const newEntry: EmergencyContact = {
                            id: `ec_${Date.now()}`,
                            name: newContactName.trim(),
                            phone: newContactPhone.trim(),
                            note: newContactNote.trim() || 'On Call'
                          };
                          setSettingsForm({
                            ...settingsForm,
                            emergencyContacts: [...(settingsForm.emergencyContacts || []), newEntry]
                          });
                          setNewContactName('');
                          setNewContactPhone('');
                          setNewContactNote('');
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                        title="যোগ করুন"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 6: Donation Appeal & About Us Texts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">আবেদন ও পরিচিতি টেক্সট (Appeal & About Us)</h4>
                      <p className="text-[11px] text-slate-400">ডোনেশন পাতার আবেদন ও অ্যাপের বিবরণ</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Editable</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ডোনেশন ফান্ড আবেদন টেক্সট (Donation Appeal)</label>
                    <textarea 
                      rows={2}
                      value={settingsForm.donationAppealText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, donationAppealText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-medium"
                      placeholder="Help fund emergency patient blood bags and community awareness."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">আমাদের সম্পর্কে বিবরণ (About Us Description)</label>
                    <textarea 
                      rows={3}
                      value={settingsForm.aboutUsText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aboutUsText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-red-500 font-medium"
                      placeholder="Friends Blood Donation Mymensingh (FBDM) ময়মনসিংহ জেলার বৃহত্তম স্বেচ্ছাসেবী রক্তদাতা নেটওয়ার্ক।"
                    />
                  </div>
                </div>
              </div>

              {/* Card 7: Add New Admin Without Changing Code */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/30 flex items-center justify-center text-red-400">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-base">কোড পরিবর্তন ছাড়া নতুন এডমিন যুক্ত করুন (Add Admin Account)</h4>
                      <p className="text-xs text-slate-300">কোনো কোডিং পরিবর্তন ছাড়াই সরাসরি নতুন এডমিন ইমেইল ও পাসওয়ার্ড সেট করুন</p>
                    </div>
                  </div>

                  <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
                    <span className="text-slate-300">ডিফল্ট এডমিন: </span>
                    <span className="font-mono font-bold text-amber-400">admin@fbdm.com</span>
                    <span className="text-slate-400 ml-1">/ pass: </span>
                    <span className="font-mono font-bold text-amber-400">admin@ca.com</span>
                  </div>
                </div>

                {/* Form to Add New Admin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">এডমিনের নাম</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: Arif Ahmed"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">এডমিন ইমেইল</label>
                    <input 
                      type="email" 
                      placeholder="admin2@fbdm.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">মোবাইল নাম্বার</label>
                    <input 
                      type="text" 
                      placeholder="017XXXXXXXX"
                      value={newAdminMobile}
                      onChange={(e) => setNewAdminMobile(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-red-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">এডমিন পদবী</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as UserRole)}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-red-400 font-bold"
                    >
                      <option value={UserRole.ADMIN}>ADMIN (সাধারণ এডমিন)</option>
                      <option value={UserRole.MAIN_ADMIN}>MAIN_ADMIN (প্রধান এডমিন)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminMobile.trim() || !newAdminPassword.trim()) {
                        showNotification('⚠️ অনুগ্রহ করে এডমিনের নাম, ইমেইল, মোবাইল ও পাসওয়ার্ড পূরণ করুন।');
                        return;
                      }
                      if (newAdminPassword.length < 6) {
                        showNotification('⚠️ পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
                        return;
                      }
                      setPasswordError(null);
                      setAdminPasswordInput('');
                      setPendingAction('CREATE_ADMIN');
                      setIsPasswordModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <UserPlus size={16} />
                    <span>নতুন এডমিন তৈরি করুন (Add New Admin)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: EDIT USER MODAL (With Last Donation Date, Count, Availability) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">ডোনার ও ইউজার তথ্য সম্পাদনা</h3>
                  <p className="text-xs text-slate-400">রক্তদানের ইতিহাস, শেষ ডোনেটের তারিখ ও প্রাপ্যতা আপডেট করুন</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">পূর্ণ নাম (Full Name)</label>
                  <input 
                    type="text" 
                    value={editingUser.name} 
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">রক্তের গ্রুপ (Blood Group)</label>
                  <select 
                    value={editingUser.bloodGroup} 
                    onChange={e => setEditingUser({ ...editingUser, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold text-red-600"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CRITICAL: LAST DONATION DATE & DONATION COUNT */}
              <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-100 space-y-3">
                <span className="text-[11px] font-extrabold text-red-700 flex items-center gap-1.5">
                  <Droplet size={14} className="fill-red-600 text-red-600" />
                  <span>রক্তদানের ইতিহাস ও তারিখ সংশোধন</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      সর্বশেষ রক্তদানের তারিখ (Last Donation Date)
                    </label>
                    <input 
                      type="date"
                      value={editingUser.lastDonationDate || ''} 
                      onChange={e => setEditingUser({ ...editingUser, lastDonationDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">তারিখ ৯০ দিনের কম হলে স্বয়ংক্রিয়ভাবে বিশ্রাম/অপেক্ষমান দেখাবে</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মোট কতবার রক্ত দিয়েছেন? (Count)
                    </label>
                    <input 
                      type="number"
                      min={0}
                      value={editingUser.donationsCount || 0} 
                      onChange={e => setEditingUser({ ...editingUser, donationsCount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">লিডারবোর্ডে রেংক নির্ধারণ করে</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox"
                    id="editUserAvailCheck"
                    checked={editingUser.isAvailable}
                    onChange={e => setEditingUser({ ...editingUser, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded cursor-pointer"
                  />
                  <label htmlFor="editUserAvailCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    স্বেচ্ছায় রক্তদানের জন্য প্রস্তুত ও উপলব্ধ (Mark Available)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">মোবাইল নাম্বার</label>
                  <input 
                    type="text" 
                    value={editingUser.mobile} 
                    onChange={e => setEditingUser({ ...editingUser, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">উপজেলা (Upazila)</label>
                  <input 
                    type="text" 
                    value={editingUser.upazila} 
                    onChange={e => setEditingUser({ ...editingUser, upazila: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ঠিকানা (Address)</label>
                <input 
                  type="text" 
                  value={editingUser.address || ''} 
                  onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ইউজার পদবী (Role)</label>
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  >
                    <option value={UserRole.USER}>USER</option>
                    <option value={UserRole.MODERATOR}>MODERATOR</option>
                    <option value={UserRole.ADMIN}>ADMIN</option>
                    <option value={UserRole.MAIN_ADMIN}>MAIN_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">অনুমোদন স্ট্যাটাস (Approval)</label>
                  <select 
                    value={editingUser.isApproved ? 'APPROVED' : 'PENDING'} 
                    onChange={e => setEditingUser({ ...editingUser, isApproved: e.target.value === 'APPROVED' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  >
                    <option value="APPROVED">Approved (সক্রিয়)</option>
                    <option value="PENDING">Pending (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUserEdit(editingUser)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>সংরক্ষণ করুন (Save)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NOTICE EDIT MODAL */}
      {isNoticeModalOpen && editingNotice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingNotice.title ? 'নোটিশ সম্পাদনা (Edit Notice)' : 'নতুন নোটিশ তৈরি'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsNoticeModalOpen(false); setEditingNotice(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">নোটিশের শিরোনাম (Title)</label>
                <input 
                  type="text" 
                  value={editingNotice.title} 
                  onChange={e => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  placeholder="যেমন: জরুরী নোটিশ বা ক্যাম্পেইন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">নোটিশের বিষয়বস্তু (Content)</label>
                <textarea 
                  rows={4}
                  value={editingNotice.content} 
                  onChange={e => setEditingNotice({ ...editingNotice, content: e.target.value })}
                  placeholder="বিস্তারিত বিবরণ লিখুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">তারিখ (Date)</label>
                  <input 
                    type="date" 
                    value={editingNotice.date} 
                    onChange={e => setEditingNotice({ ...editingNotice, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">অগ্রাধিকার (Priority)</label>
                  <select 
                    value={editingNotice.priority} 
                    onChange={e => setEditingNotice({ ...editingNotice, priority: e.target.value as 'NORMAL' | 'HIGH' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH (জরুরী)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsNoticeModalOpen(false); setEditingNotice(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingNotice.title.trim() || !editingNotice.content.trim()) {
                      alert('অনুগ্রহ করে শিরোনাম ও বিষয়বস্তু পূরণ করুন।');
                      return;
                    }
                    handleSaveNoticeSubmit(editingNotice);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EVENT EDIT MODAL */}
      {isEventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingEvent.title ? 'ইভেন্ট সম্পাদনা (Edit Event)' : 'নতুন রক্তদান ইভেন্ট'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ইভেন্টের নাম (Title)</label>
                <input 
                  type="text" 
                  value={editingEvent.title} 
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="যেমন: ময়মনসিংহ মেডিকেল রক্তদান ক্যাম্প"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">তারিখ ও সময় (Date & Time)</label>
                <input 
                  type="text" 
                  value={editingEvent.date} 
                  onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  placeholder="যেমন: 2024-06-20 10:00 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">স্থান (Location)</label>
                <input 
                  type="text" 
                  value={editingEvent.location} 
                  onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder="যেমন: Mymensingh Medical College"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">যোগাযোগ ব্যক্তি (Contact)</label>
                  <input 
                    type="text" 
                    value={editingEvent.contactPerson} 
                    onChange={e => setEditingEvent({ ...editingEvent, contactPerson: e.target.value })}
                    placeholder="নাম ও মোবাইল"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">আগ্রহী ডোনার সংখ্যা</label>
                  <input 
                    type="number" 
                    value={editingEvent.interestedCount || 0} 
                    onChange={e => setEditingEvent({ ...editingEvent, interestedCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-red-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingEvent.title.trim() || !editingEvent.location.trim()) {
                      alert('অনুগ্রহ করে নাম ও স্থান পূরণ করুন।');
                      return;
                    }
                    handleSaveEventSubmit(editingEvent);
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN PASSWORD VERIFICATION MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">এডমিন নিরাপত্তা যাচাই</h3>
                <p className="text-xs text-slate-500">পরিবর্তন নিশ্চিত করতে আপনার এডমিন পাসওয়ার্ড দিন</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {pendingAction === 'SAVE_SETTINGS' 
                ? 'আপনি অ্যাপের অফিসিয়াল তথ্য, টেক্সট, ডোনেশন নাম্বার বা সংস্থার সেটিংস পরিবর্তন করছেন। এটি নিশ্চিত করতে এডমিন পাসওয়ার্ড লিখুন।'
                : 'আপনি একটি নতুন এডমিন একাউন্ট তৈরি করছেন। এটি অনুমোদন করতে এডমিন পাসওয়ার্ড লিখুন।'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">এডমিন পাসওয়ার্ড (Admin Password)</label>
              <input 
                type="password"
                placeholder="এডমিন পাসওয়ার্ড দিন..."
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setPasswordError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmPasswordAction();
                  }
                }}
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-red-500"
              />
              {passwordError && (
                <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError(null);
                  setAdminPasswordInput('');
                  setPendingAction(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                বাতিল করুন
              </button>

              <button
                onClick={handleConfirmPasswordAction}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>যাচাই ও সংরক্ষণ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin PDF Downloadable Report Modal */}
      {showReportModal && (
        <AdminReportModal
          requests={requests}
          donations={donations}
          users={donors}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number, subValue: string, icon: React.ReactNode }> = ({ label, value, subValue, icon }) => (
  <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100">
    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center mb-2.5">{icon}</div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">{value}</p>
    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subValue}</p>
  </div>
);

export default AdminDashboardView;
