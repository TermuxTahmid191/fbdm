
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
  LoaderCircle,
  CreditCard,
  Award,
  BarChart3,
  Trophy,
  HelpCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { collection, query, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { User, BloodRequest, Notice, DonationEvent, MoneyDonation, UserRole, AppNotification, ScheduledDonation, AppSettings } from './types';
import { initialNotices, initialEvents, initialRequests, initialDonors, initialDonations, adminUser, initialAppSettings } from './store';

// Views
import HomeView from './views/Home';
import SearchView from './views/Search';
import RequestView from './views/Requests';
import DonationView from './views/Donations';
import ProfileView from './views/Profile';
import AdminDashboardView from './views/AdminDashboard';
import AuthView from './views/Auth';
import FAQView from './views/FAQ';

// New Features & Modals
import { DigitalCertificate } from './components/DigitalCertificate';
import { MembershipCard } from './components/MembershipCard';
import { DonationAnalysis } from './components/DonationAnalysis';
import { NotificationCenter } from './components/NotificationCenter';
import { TopDonorsLeaderboard } from './components/TopDonorsLeaderboard';
import { DonationScheduler } from './components/DonationScheduler';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const stored = localStorage.getItem('fbdm_notices');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initialNotices;
  });
  const [events, setEvents] = useState<DonationEvent[]>(() => {
    try {
      const stored = localStorage.getItem('fbdm_events');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initialEvents;
  });
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
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('fbdm_app_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load local app settings:", e);
    }
    return initialAppSettings;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New Features Modal States
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isMembershipCardOpen, setIsMembershipCardOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [scheduledDonations, setScheduledDonations] = useState<ScheduledDonation[]>(() => {
    try {
      const stored = localStorage.getItem('fbdm_scheduled_donations');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load local scheduled donations:", e);
    }
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 3);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 8);
    return [
      {
        id: 'sched_1',
        userId: 'u1',
        userName: 'Tanvir Hossain',
        userBloodGroup: 'O+',
        userMobile: '01711223344',
        targetDate: d1.toISOString().split('T')[0],
        hospitalOrCenter: 'Mymensingh Medical College Hospital (MMCH)',
        notes: 'Regular voluntary whole blood donation',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sched_2',
        userId: 'u2',
        userName: 'Sadia Rahman',
        userBloodGroup: 'A+',
        userMobile: '01822334455',
        targetDate: d2.toISOString().split('T')[0],
        hospitalOrCenter: 'Red Crescent Society, Mymensingh Unit (Town Hall)',
        notes: 'Pledging for thalassemia patient in Charpara',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Push Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      title: '🚨 Urgent: O+ Blood Needed Immediately',
      message: 'Mymensingh Medical College Hospital (MMCH) ICU - 2 units needed for emergency surgery.',
      type: 'URGENT_BLOOD',
      timestamp: '10m ago',
      isRead: false,
      actionTab: 'request',
      bloodGroup: 'O+'
    },
    {
      id: 'notif_2',
      title: '🚨 Critical Emergency: B- Needed',
      message: 'Community Based Medical College Hospital (CBMCH), Churkhai, Mymensingh.',
      type: 'URGENT_BLOOD',
      timestamp: '1h ago',
      isRead: false,
      actionTab: 'request',
      bloodGroup: 'B-'
    },
    {
      id: 'notif_3',
      title: '🏆 Donor Certificate Generated',
      message: 'Your official FBDM Digital Certificate of Appreciation is ready to view and download.',
      type: 'DONATION',
      timestamp: 'Yesterday',
      isRead: false,
      actionTab: 'profile'
    },
    {
      id: 'notif_4',
      title: '📢 Town Hall Blood Drive This Friday',
      message: 'Join us at Mymensingh Town Hall premises from 9:00 AM. Free health screening for all donors.',
      type: 'ANNOUNCEMENT',
      timestamp: '2d ago',
      isRead: true,
      actionTab: 'home'
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

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

  // Real-time synchronization across browser tabs
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('fbdm_realtime_channel');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'REQUEST_CREATED') {
          setRequests(prev => [payload, ...prev.filter(r => r.id !== payload.id)]);
        } else if (type === 'REQUEST_STATUS') {
          setRequests(prev => prev.map(r => r.id === payload.id ? { ...r, status: payload.status } : r));
        } else if (type === 'REQUEST_DELETED') {
          setRequests(prev => prev.filter(r => r.id !== payload.id));
        } else if (type === 'DONATION_CREATED') {
          setMoneyDonations(prev => [payload, ...prev.filter(d => d.id !== payload.id)]);
        } else if (type === 'DONATION_STATUS') {
          setMoneyDonations(prev => prev.map(d => d.id === payload.id ? { ...d, status: payload.status } : d));
        } else if (type === 'USER_UPDATED') {
          setDonors(prev => prev.map(u => u.id === payload.id ? { ...u, ...payload.updates } : u));
        } else if (type === 'SETTINGS_UPDATED') {
          setAppSettings(payload);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }

    return () => {
      try {
        channel?.close();
      } catch (e) {}
    };
  }, []);

  const broadcastEvent = (type: string, payload: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('fbdm_realtime_channel');
        ch.postMessage({ type, payload });
        setTimeout(() => ch.close(), 100);
      }
    } catch (e) {}
  };

  // Firestore Live Subscriptions (resilient without requiring complex composite indexes)
  useEffect(() => {
    let unsubReq = () => {};
    let unsubDonors = () => {};
    let unsubDonations = () => {};
    let unsubSettings = () => {};

    try {
      // 1. Blood Requests listener
      const reqCol = collection(db, "requests");
      unsubReq = onSnapshot(reqCol, (snapshot) => {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BloodRequest));
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return tB - tA;
          });
          setRequests(sorted);
          try { localStorage.setItem('fbdm_blood_requests', JSON.stringify(sorted)); } catch(e){}
        }
      }, (err) => {
        console.warn("Firestore requests subscription notice:", err.message);
      });
    } catch (e) {
      console.warn("Firestore requests error:", e);
    }

    try {
      // 2. Donors / Users listener
      const donorsCol = collection(db, "users");
      unsubDonors = onSnapshot(donorsCol, (snapshot) => {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
        if (data.length > 0) {
          setDonors(data);
          try { localStorage.setItem('fbdm_registered_users', JSON.stringify(data)); } catch(e){}
        }
      }, (err) => {
        console.warn("Firestore donors subscription notice:", err.message);
      });
    } catch (e) {
      console.warn("Firestore donors error:", e);
    }

    try {
      // 3. Donations listener
      const donationsCol = collection(db, "donations");
      unsubDonations = onSnapshot(donationsCol, (snapshot) => {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MoneyDonation));
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const tA = (a.date as any)?.toDate ? (a.date as any).toDate().getTime() : (a.date ? new Date(a.date).getTime() : 0);
            const tB = (b.date as any)?.toDate ? (b.date as any).toDate().getTime() : (b.date ? new Date(b.date).getTime() : 0);
            return tB - tA;
          });
          setMoneyDonations(sorted);
          try { localStorage.setItem('fbdm_money_donations', JSON.stringify(sorted)); } catch(e){}
        }
      }, (err) => {
        console.warn("Firestore donations subscription notice:", err.message);
      });
    } catch (e) {
      console.warn("Firestore donations error:", e);
    }

    try {
      // 4. App & Donation Settings listener
      const settingsDocRef = doc(db, "settings", "global_app_settings");
      unsubSettings = onSnapshot(settingsDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AppSettings;
          setAppSettings(data);
          try { localStorage.setItem('fbdm_app_settings', JSON.stringify(data)); } catch(e){}
        }
      }, (err) => {
        console.warn("Firestore settings subscription notice:", err.message);
      });
    } catch (e) {
      console.warn("Firestore settings error:", e);
    }

    // 5. Notices listener
    let unsubNotices = () => {};
    try {
      const noticesCol = collection(db, "notices");
      unsubNotices = onSnapshot(noticesCol, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Notice));
          setNotices(list);
          try { localStorage.setItem('fbdm_notices', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn("Notices sync notice:", err.message));
    } catch (e) {}

    // 6. Events listener
    let unsubEvents = () => {};
    try {
      const eventsCol = collection(db, "events");
      unsubEvents = onSnapshot(eventsCol, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as DonationEvent));
          setEvents(list);
          try { localStorage.setItem('fbdm_events', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn("Events sync notice:", err.message));
    } catch (e) {}

    return () => {
      unsubReq();
      unsubDonors();
      unsubDonations();
      unsubSettings();
      unsubNotices();
      unsubEvents();
    };
  }, []);

  // Handlers for Notices & Events Management
  const handleSaveNotice = async (notice: Notice) => {
    setNotices(prev => {
      const updated = [notice, ...prev.filter(n => n.id !== notice.id)];
      try { localStorage.setItem('fbdm_notices', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('NOTICES_UPDATED', notice);
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "notices", notice.id), notice, { merge: true });
      } catch (e) {
        console.warn("Firestore save notice error:", e);
      }
    }
  };

  const handleDeleteNotice = async (id: string) => {
    setNotices(prev => {
      const updated = prev.filter(n => n.id !== id);
      try { localStorage.setItem('fbdm_notices', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('NOTICES_DELETED', { id });
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "notices", id));
      } catch (e) {
        console.warn("Firestore delete notice error:", e);
      }
    }
  };

  const handleSaveEvent = async (event: DonationEvent) => {
    setEvents(prev => {
      const updated = [event, ...prev.filter(e => e.id !== event.id)];
      try { localStorage.setItem('fbdm_events', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('EVENTS_UPDATED', event);
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "events", event.id), event, { merge: true });
      } catch (e) {
        console.warn("Firestore save event error:", e);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id);
      try { localStorage.setItem('fbdm_events', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('EVENTS_DELETED', { id });
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (e) {
        console.warn("Firestore delete event error:", e);
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(prev => prev && prev.id === updatedUser.id ? updatedUser : prev);
    setDonors(prev => {
      const updated = prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
      if (!updated.some(u => u.id === updatedUser.id)) updated.push(updatedUser);
      try { localStorage.setItem('fbdm_registered_users', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('USER_UPDATED', { id: updatedUser.id, updates: updatedUser });
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", updatedUser.id), updatedUser, { merge: true });
      } catch (e) {
        console.warn("Firestore save user error:", e);
      }
    }
  };

  // Handlers for Request Creation, Status Updates & Deletions
  const handleRequestCreated = async (newReq: BloodRequest) => {
    setRequests(prev => {
      const updated = [newReq, ...prev.filter(r => r.id !== newReq.id)];
      try { localStorage.setItem('fbdm_blood_requests', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('REQUEST_CREATED', newReq);
  };

  const handleRequestStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status } : r);
      try { localStorage.setItem('fbdm_blood_requests', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('REQUEST_STATUS', { id, status });
    try {
      await setDoc(doc(db, "requests", id), { 
        status, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore request status change warning:", e);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    setRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      try { localStorage.setItem('fbdm_blood_requests', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('REQUEST_DELETED', { id });
    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (e) {
      console.warn("Firestore delete request warning:", e);
    }
  };

  // Handlers for Money Donations
  const handleDonationCreated = async (newDonation: MoneyDonation) => {
    setMoneyDonations(prev => {
      const updated = [newDonation, ...prev.filter(d => d.id !== newDonation.id)];
      try { localStorage.setItem('fbdm_money_donations', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('DONATION_CREATED', newDonation);
  };

  const handleDonationStatusChange = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setMoneyDonations(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status } : d);
      try { localStorage.setItem('fbdm_money_donations', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('DONATION_STATUS', { id, status });
    try {
      await setDoc(doc(db, "donations", id), { 
        status, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore donation status change warning:", e);
    }
  };

  // Handlers for Community Member Updates
  const handleUserStatusChange = async (id: string, updates: Partial<User>) => {
    setDonors(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      try { localStorage.setItem('fbdm_registered_users', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    broadcastEvent('USER_UPDATED', { id, updates });
    try {
      await setDoc(doc(db, "users", id), { 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore user status change warning:", e);
    }
  };

  const handleSaveSchedule = async (newSchedule: ScheduledDonation) => {
    setScheduledDonations(prev => {
      const updated = [newSchedule, ...prev];
      try {
        localStorage.setItem('fbdm_scheduled_donations', JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return updated;
    });
    setIsScheduleModalOpen(false);

    try {
      const docRef = doc(db, "scheduled_donations", newSchedule.id);
      await setDoc(docRef, newSchedule);
    } catch (e) {
      console.warn("Firestore scheduled donation save skipped:", e);
    }
  };

  const handleCompleteScheduledDonation = (id: string) => {
    setScheduledDonations(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('fbdm_scheduled_donations', JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return updated;
    });
  };

  const handleUpdateAppSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    try { localStorage.setItem('fbdm_app_settings', JSON.stringify(newSettings)); } catch(e){}
    broadcastEvent('SETTINGS_UPDATED', newSettings);
  };

  const handleAddNewAdmin = (newAdminData: { name: string; email: string; mobile: string; password: string; role: UserRole }) => {
    const newAdminObj: User = {
      id: `admin_${Date.now()}`,
      name: newAdminData.name,
      role: newAdminData.role,
      bloodGroup: 'O+',
      division: 'Mymensingh',
      district: 'Mymensingh',
      upazila: 'Sadar',
      address: 'Mymensingh Sadar',
      mobile: newAdminData.mobile,
      whatsapp: newAdminData.mobile,
      email: newAdminData.email,
      lastDonationDate: null,
      isAvailable: true,
      isApproved: true,
      donationsCount: 0
    };
    setDonors(prev => [newAdminObj, ...prev.filter(d => d.id !== newAdminObj.id)]);
    broadcastEvent('USER_UPDATED', { id: newAdminObj.id, updates: newAdminObj });
  };

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
      case 'home': 
        return (
          <HomeView 
            notices={notices} 
            events={events} 
            onNavigate={setActiveTab} 
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenMembershipCard={() => setIsMembershipCardOpen(true)}
            onOpenAnalysis={() => setIsAnalysisOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
            onOpenFAQ={() => setActiveTab('faq')}
            upcomingDonations={scheduledDonations}
            onCompleteScheduledDonation={handleCompleteScheduledDonation}
            appSettings={appSettings}
          />
        );
      case 'search': return <SearchView donors={donors} />;
      case 'request': 
        return (
          <RequestView 
            requests={requests} 
            user={currentUser} 
            onRequestCreated={handleRequestCreated} 
          />
        );
      case 'donations': 
        return (
          <DonationView 
            donations={moneyDonations} 
            user={currentUser} 
            onDonationCreated={handleDonationCreated} 
            appSettings={appSettings}
          />
        );
      case 'profile': 
        return (
          <ProfileView 
            user={currentUser} 
            setUser={setCurrentUser} 
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenMembershipCard={() => setIsMembershipCardOpen(true)}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'faq':
        return <FAQView onNavigate={setActiveTab} />;
      case 'admin': return (
        <AdminDashboardView 
          requests={requests} 
          donations={moneyDonations} 
          donors={donors} 
          currentUser={currentUser}
          notices={notices}
          events={events}
          onRequestStatusChange={handleRequestStatusChange}
          onDonationStatusChange={handleDonationStatusChange}
          onUserStatusChange={handleUserStatusChange}
          onDeleteRequest={handleDeleteRequest}
          onOpenAnalysis={() => setIsAnalysisOpen(true)}
          appSettings={appSettings}
          onUpdateAppSettings={handleUpdateAppSettings}
          onAddNewAdmin={handleAddNewAdmin}
          onSaveNotice={handleSaveNotice}
          onDeleteNotice={handleDeleteNotice}
          onSaveEvent={handleSaveEvent}
          onDeleteEvent={handleDeleteEvent}
          onUpdateUser={handleUpdateUser}
        />
      );
      default: 
        return (
          <HomeView 
            notices={notices} 
            events={events} 
            onNavigate={setActiveTab} 
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenMembershipCard={() => setIsMembershipCardOpen(true)}
            onOpenAnalysis={() => setIsAnalysisOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
            onOpenFAQ={() => setActiveTab('faq')}
            upcomingDonations={scheduledDonations}
            onCompleteScheduledDonation={handleCompleteScheduledDonation}
            appSettings={appSettings}
          />
        );
    }
  };

  const isAdmin = currentUser && [UserRole.ADMIN, UserRole.MAIN_ADMIN, UserRole.MODERATOR].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-red-600 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <Heart className="fill-white text-white" />
          <h1 className="text-xl font-bold tracking-tight">FBDM</h1>
        </div>
        <div className="flex items-center space-x-2.5">
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

          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-1.5 hover:bg-red-700 rounded-xl transition-colors"
            title="Push Notifications"
          >
            <Bell size={21} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-red-600 text-[9px] font-black rounded-full flex items-center justify-center shadow">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {currentUser && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-red-700 rounded-lg">
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

            <nav className="flex-1 space-y-1.5 overflow-y-auto hide-scrollbar">
              <NavItem icon={<HomeIcon size={20} />} label="Home" active={activeTab === 'home'} onClick={() => {setActiveTab('home'); setIsSidebarOpen(false);}} />
              <NavItem icon={<Search size={20} />} label="Donor Search" active={activeTab === 'search'} onClick={() => {setActiveTab('search'); setIsSidebarOpen(false);}} />
              <NavItem icon={<PlusCircle size={20} />} label="Request Blood" active={activeTab === 'request'} onClick={() => {setActiveTab('request'); setIsSidebarOpen(false);}} />
              <NavItem icon={<DollarSign size={20} />} label="Donate Money" active={activeTab === 'donations'} onClick={() => {setActiveTab('donations'); setIsSidebarOpen(false);}} />
              <NavItem icon={<HelpCircle size={20} />} label="Donor FAQ (সহায়িকা)" active={activeTab === 'faq'} onClick={() => {setActiveTab('faq'); setIsSidebarOpen(false);}} />
              <NavItem icon={<UserIcon size={20} />} label="My Profile" active={activeTab === 'profile'} onClick={() => {setActiveTab('profile'); setIsSidebarOpen(false);}} />

              {/* Quick Donor Features Section */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Donor Services</p>
                <button 
                  onClick={() => { setIsLeaderboardOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left text-xs font-semibold"
                >
                  <Trophy size={18} className="text-purple-600 flex-shrink-0" />
                  <span>Top Donors Leaderboard</span>
                </button>
                <button 
                  onClick={() => { setIsScheduleModalOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left text-xs font-semibold"
                >
                  <CalendarIcon size={18} className="text-red-500 flex-shrink-0" />
                  <span>Schedule Next Donation</span>
                </button>
                <button 
                  onClick={() => { setIsMembershipCardOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left text-xs font-semibold"
                >
                  <CreditCard size={18} className="text-red-500 flex-shrink-0" />
                  <span>Membership Card</span>
                </button>
                <button 
                  onClick={() => { setIsCertificateOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left text-xs font-semibold"
                >
                  <Award size={18} className="text-amber-500 flex-shrink-0" />
                  <span>Digital Certificate</span>
                </button>
                <button 
                  onClick={() => { setIsAnalysisOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left text-xs font-semibold"
                >
                  <BarChart3 size={18} className="text-blue-500 flex-shrink-0" />
                  <span>Donation Analysis</span>
                </button>
              </div>
              
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Management</p>
                  <NavItem icon={<ShieldCheck size={20} />} label="Admin Panel" active={activeTab === 'admin'} onClick={() => {setActiveTab('admin'); setIsSidebarOpen(false);}} />
                </div>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-100 mt-auto">
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
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 hide-scrollbar">
        {/* Desktop Top Bar */}
        {currentUser && (
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Welcome, {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500">Free Blood Donation Mymensingh Portal</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Top Donors Leaderboard"
              >
                <Trophy size={15} />
                <span>Top Donors</span>
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Donor FAQ & Guidelines"
              >
                <HelpCircle size={15} />
                <span>FAQ</span>
              </button>
              <button
                onClick={() => setIsMembershipCardOpen(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <CreditCard size={15} />
                <span>ID Card</span>
              </button>
              <button
                onClick={() => setIsCertificateOpen(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Award size={15} />
                <span>Certificate</span>
              </button>
              <button
                onClick={() => setIsAnalysisOpen(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <BarChart3 size={15} />
                <span>Analysis</span>
              </button>

              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors ml-2"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-3 z-30">
          <BottomNavItem icon={<HomeIcon size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <BottomNavItem icon={<Search size={24} />} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <BottomNavItem icon={<PlusCircle size={24} />} active={activeTab === 'request'} onClick={() => setActiveTab('request')} />
          <BottomNavItem icon={<DollarSign size={24} />} active={activeTab === 'donations'} onClick={() => setActiveTab('donations')} />
          {isAdmin && (
            <BottomNavItem icon={<ShieldCheck size={24} />} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          )}
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

      {/* Interactive Modals */}
      {isCertificateOpen && currentUser && (
        <DigitalCertificate 
          user={currentUser} 
          onClose={() => setIsCertificateOpen(false)} 
        />
      )}

      {isMembershipCardOpen && currentUser && (
        <MembershipCard 
          user={currentUser} 
          onClose={() => setIsMembershipCardOpen(false)} 
        />
      )}

      {isAnalysisOpen && (
        <DonationAnalysis 
          requests={requests} 
          donations={moneyDonations} 
          donors={donors} 
          onClose={() => setIsAnalysisOpen(false)} 
        />
      )}

      {isNotificationOpen && (
        <NotificationCenter 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead} 
          onMarkAllAsRead={handleMarkAllAsRead} 
          onNavigateTab={(tab) => { setActiveTab(tab); setIsNotificationOpen(false); }} 
          onClose={() => setIsNotificationOpen(false)} 
        />
      )}

      {/* Top Donors Leaderboard Modal */}
      {isLeaderboardOpen && (
        <TopDonorsLeaderboard
          donors={donors}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* Donation Scheduler Modal */}
      {isScheduleModalOpen && currentUser && (
        <DonationScheduler
          currentUser={currentUser}
          onSaveSchedule={handleSaveSchedule}
          onClose={() => setIsScheduleModalOpen(false)}
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