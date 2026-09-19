
import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Search, 
  PlusCircle, 
  Heart, 
  User as UserIcon, 
  Bell, 
  ShieldCheck, 
  DollarSign,
  Menu,
  X,
  LoaderCircle
} from 'lucide-react';
import { collection, query, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { User, BloodRequest, Notice, DonationEvent, MoneyDonation, UserRole } from './types';
import { initialNotices, initialEvents, initialRequests, initialDonors, initialDonations, adminUser } from './store';

// Views
import HomeView from './views/Home';
import SearchView from './views/Search';
import RequestView from './views/Requests';
import DonationView from './views/Donations';
import ProfileView from './views/Profile';
import AdminDashboardView from './views/AdminDashboard';
import AuthView from './views/Auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notices] = useState<Notice[]>(initialNotices);
  const [events] = useState<DonationEvent[]>(initialEvents);
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [donors, setDonors] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('fbdm_registered_users');
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        const merged = [...initialDonors];
        parsed.forEach(u => {
          if (!merged.some(m => m.id === u.id)) {
            merged.push(u);
          }
        });
        return merged;
      }
    } catch (e) {
      console.warn("Could not load local donors:", e);
    }
    return initialDonors;
  });
  const [moneyDonations, setMoneyDonations] = useState<MoneyDonation[]>(initialDonations);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle Auth State
  useEffect(() => {
    // Check saved session in localStorage first
    const savedUserStr = localStorage.getItem('fbdm_current_user');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.warn("Could not parse saved session:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profile = { id: user.uid, ...userDocSnap.data() } as User;
            setCurrentUser(profile);
            localStorage.setItem('fbdm_current_user', JSON.stringify(profile));
          } else {
            const fallbackProfile: User = user.email === 'admin@fbdm.com' 
              ? { ...adminUser, id: user.uid }
              : {
                  id: user.uid,
                  name: user.displayName || 'FBDM Member',
                  role: UserRole.USER,
                  bloodGroup: 'O+',
                  division: 'Mymensingh',
                  district: 'Mymensingh',
                  upazila: 'Sadar',
                  address: 'Mymensingh',
                  mobile: '01700000000',
                  whatsapp: '01700000000',
                  email: user.email || '',
                  lastDonationDate: null,
                  isAvailable: true,
                  isApproved: true,
                  donationsCount: 0
                };
            setCurrentUser(fallbackProfile);
            localStorage.setItem('fbdm_current_user', JSON.stringify(fallbackProfile));
          }
        } catch (err) {
          console.warn("Error fetching user profile from firestore:", err);
        }
      } else {
        // If not in firebase auth, preserve local admin session if it was logged in
        const local = localStorage.getItem('fbdm_current_user');
        if (!local) {
          setCurrentUser(null);
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Handle Firestore subscriptions
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let unsubReq = () => {};
    let unsubDonors = () => {};
    let unsubDonations = () => {};

    try {
      const requestsQuery = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      unsubReq = onSnapshot(requestsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BloodRequest));
        if (data.length > 0) {
          setRequests(data);
        }
      }, (err) => {
        console.warn("Firestore requests subscription skipped:", err.message);
      });
    } catch (e) {
      console.warn("Firestore requests error:", e);
    }

    try {
      const donorsQuery = query(collection(db, "users"));
      unsubDonors = onSnapshot(donorsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
        if (data.length > 0) {
          setDonors(data);
        }
      }, (err) => {
        console.warn("Firestore donors subscription skipped:", err.message);
      });
    } catch (e) {
      console.warn("Firestore donors error:", e);
    }

    try {
      const donationsQuery = query(collection(db, "donations"), orderBy("date", "desc"));
      unsubDonations = onSnapshot(donationsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MoneyDonation));
        if (data.length > 0) {
          setMoneyDonations(data);
        }
      }, (err) => {
        console.warn("Firestore donations subscription skipped:", err.message);
      });
    } catch (e) {
      console.warn("Firestore donations error:", e);
    }

    return () => {
      unsubReq();
      unsubDonors();
      unsubDonations();
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('fbdm_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setDonors(prev => {
      if (!prev.some(d => d.id === user.id)) {
        return [...prev, user];
      }
      return prev;
    });
    if (user.role === UserRole.ADMIN || user.role === UserRole.MAIN_ADMIN) {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    localStorage.removeItem('fbdm_current_user');
    setCurrentUser(null);
    setActiveTab('home');
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    if (!authChecked) {
      return (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle size={48} className="animate-spin text-red-600" />
        </div>
      );
    }
    if (!currentUser) {
      return <AuthView onLogin={handleLoginSuccess} />;
    }

    switch (activeTab) {
      case 'home': return <HomeView notices={notices} events={events} onNavigate={setActiveTab} />;
      case 'search': return <SearchView donors={donors} />;
      case 'request': 
        return (
          <RequestView 
            requests={requests} 
            user={currentUser} 
            onRequestCreated={(newReq) => setRequests(prev => [newReq, ...prev])} 
          />
        );
      case 'donations': 
        return (
          <DonationView 
            donations={moneyDonations} 
            user={currentUser} 
            onDonationCreated={(newDonation) => setMoneyDonations(prev => [newDonation, ...prev])} 
          />
        );
      case 'profile': return <ProfileView user={currentUser} setUser={setCurrentUser} />;
      case 'admin': return (
        <AdminDashboardView 
          requests={requests} 
          donations={moneyDonations} 
          donors={donors} 
          currentUser={currentUser}
          onRequestStatusChange={(id, status) => {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
          }}
          onDonationStatusChange={(id, status) => {
            setMoneyDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
          }}
        />
      );
      default: return <HomeView notices={notices} events={events} onNavigate={setActiveTab} />;
    }
  };

  const isAdmin = currentUser && [UserRole.ADMIN, UserRole.MAIN_ADMIN, UserRole.MODERATOR].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-red-600 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <Heart className="fill-white text-white" />
          <h1 className="text-xl font-bold tracking-tight">FBDM</h1>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin' ? 'bg-white text-red-600 shadow' : 'bg-red-700 text-white hover:bg-red-800'
              }`}
              title="Admin Console"
            >
              <ShieldCheck size={14} />
              <span className="text-[11px]">Admin</span>
            </button>
          )}
          <Bell size={22} className="cursor-pointer" />
          {currentUser && (
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Sidebar (Desktop & Mobile Overlay) */}
      {currentUser && (
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 md:justify-center">
              <div className="flex items-center space-x-2 text-red-600">
                <Heart className="fill-red-600" />
                <span className="text-2xl font-black italic">FBDM</span>
              </div>
              <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              <NavItem icon={<HomeIcon size={20} />} label="Home" active={activeTab === 'home'} onClick={() => {setActiveTab('home'); setIsSidebarOpen(false);}} />
              <NavItem icon={<Search size={20} />} label="Donor Search" active={activeTab === 'search'} onClick={() => {setActiveTab('search'); setIsSidebarOpen(false);}} />
              <NavItem icon={<PlusCircle size={20} />} label="Request Blood" active={activeTab === 'request'} onClick={() => {setActiveTab('request'); setIsSidebarOpen(false);}} />
              <NavItem icon={<DollarSign size={20} />} label="Donate Money" active={activeTab === 'donations'} onClick={() => {setActiveTab('donations'); setIsSidebarOpen(false);}} />
              <NavItem icon={<UserIcon size={20} />} label="My Profile" active={activeTab === 'profile'} onClick={() => {setActiveTab('profile'); setIsSidebarOpen(false);}} />
              
              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Management</p>
                  <NavItem icon={<ShieldCheck size={20} />} label="Admin Panel" active={activeTab === 'admin'} onClick={() => {setActiveTab('admin'); setIsSidebarOpen(false);}} />
                </div>
              )}
            </nav>

            <div className="pt-6 border-t border-slate-100 mt-auto">
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.bloodGroup} Group</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 hide-scrollbar">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-3 z-50">
          <BottomNavItem icon={<HomeIcon size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <BottomNavItem icon={<Search size={24} />} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <BottomNavItem icon={<PlusCircle size={24} />} active={activeTab === 'request'} onClick={() => setActiveTab('request')} />
          <BottomNavItem icon={<DollarSign size={24} />} active={activeTab === 'donations'} onClick={() => setActiveTab('donations')} />
          <BottomNavItem icon={<UserIcon size={24} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      )}
      
      {/* Background Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-red-50 text-red-600 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    <span className={active ? 'text-red-600' : 'text-slate-400'}>{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const BottomNavItem: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center transition-colors ${active ? 'text-red-600' : 'text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;