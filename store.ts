
import { Notice, DonationEvent, User, BloodRequest, MoneyDonation, UserRole, AppSettings } from './types';

export const adminUser: User = {
  id: 'admin_fbdm',
  name: 'Main Admin',
  role: UserRole.MAIN_ADMIN,
  bloodGroup: 'O+',
  division: 'Mymensingh',
  district: 'Mymensingh',
  upazila: 'Sadar',
  address: 'Town Hall Area, Mymensingh',
  mobile: '01700000000',
  whatsapp: '01700000000',
  email: 'admin@fbdm.com',
  lastDonationDate: '2024-01-15',
  isAvailable: true,
  isApproved: true,
  donationsCount: 12
};

export const initialNotices: Notice[] = [
  { id: 'n1', title: 'World Blood Donor Day', content: 'Join us for a massive drive next Sunday at Medical College.', date: '2024-06-14', priority: 'HIGH' },
  { id: 'n2', title: 'New App Launched!', content: 'Welcome to the FBDM official application. Stay connected.', date: '2024-05-20', priority: 'NORMAL' }
];

export const initialEvents: DonationEvent[] = [
  { id: 'e1', title: 'Medical College Drive', date: '2024-06-20 10:00 AM', location: 'Mymensingh Medical College', contactPerson: 'Arif Ahmed', interestedCount: 45 }
];

export const initialDonors: User[] = [
  adminUser,
  {
    id: 'd1',
    name: 'Kabir Khan',
    role: UserRole.USER,
    bloodGroup: 'B+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Sadar',
    address: 'Patgudam, Mymensingh',
    mobile: '01711223344',
    whatsapp: '01711223344',
    email: 'kabir@example.com',
    lastDonationDate: '2024-01-01',
    isAvailable: true,
    isApproved: true,
    donationsCount: 8
  },
  {
    id: 'd2',
    name: 'Zarin Tasnim',
    role: UserRole.USER,
    bloodGroup: 'O+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Trishal',
    address: 'University Gate, Trishal',
    mobile: '01511223344',
    whatsapp: '01511223344',
    email: 'zarin@example.com',
    lastDonationDate: '2024-04-15',
    isAvailable: false,
    isApproved: true,
    donationsCount: 2
  },
  {
    id: 'd3',
    name: 'Mahbub Alam',
    role: UserRole.USER,
    bloodGroup: 'A+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Muktagacha',
    address: 'Rajbari Road, Muktagacha',
    mobile: '01811223344',
    whatsapp: '01811223344',
    email: 'mahbub@example.com',
    lastDonationDate: '2023-11-20',
    isAvailable: true,
    isApproved: true,
    donationsCount: 5
  }
];

export const initialRequests: BloodRequest[] = [
  {
    id: 'r1',
    patientName: 'Sufia Begum',
    bloodGroup: 'B+',
    units: 2,
    hospitalName: 'MMCH (Mymensingh Medical College)',
    location: 'Ward 5, 2nd Floor',
    requiredAt: 'Today 08:00 PM',
    contactNumber: '01811111111',
    requestedBy: 'admin_fbdm',
    status: 'APPROVED',
    isEmergency: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r2',
    patientName: 'Kamil Hossain',
    bloodGroup: 'A-',
    units: 1,
    hospitalName: 'Christian Mission Hospital',
    location: 'Cabin 202',
    requiredAt: 'Tomorrow 10:00 AM',
    contactNumber: '01922222222',
    requestedBy: 'd1',
    status: 'PENDING',
    isEmergency: false,
    createdAt: new Date().toISOString()
  }
];

export const initialDonations: MoneyDonation[] = [
  {
    id: 'm1',
    userId: 'admin_fbdm',
    userName: 'Main Admin',
    userMobile: '01700000000',
    amount: 1000,
    paymentMethod: 'bKash',
    accountUsed: '01700000000',
    transactionId: 'TXN987654321',
    date: { toDate: () => new Date('2024-05-20') },
    note: 'Community fund support',
    status: 'VERIFIED'
  },
  {
    id: 'm2',
    userId: 'd1',
    userName: 'Kabir Khan',
    userMobile: '01711223344',
    amount: 500,
    paymentMethod: 'Nagad',
    accountUsed: '01711223344',
    transactionId: 'NGD54321987',
    date: { toDate: () => new Date('2024-06-01') },
    note: 'Monthly donation',
    status: 'PENDING'
  }
];

export const initialAppSettings: AppSettings = {
  orgName: 'Friends Blood Donation Mymensingh (FBDM)',
  tagline: 'স্বেচ্ছায় করি রক্তদান, হাসবে রোগী বাঁচবে প্রাণ',
  emergencyHotline: '01700-000000',
  officialEmail: 'admin@fbdm.com',
  facebookGroupUrl: 'https://facebook.com/groups/fbdm.mymensingh',
  facebookPageUrl: 'https://facebook.com/fbdm.official',
  officeAddress: 'Town Hall Premises, Mymensingh Sadar, Mymensingh',
  bkashNumber: '01700-000000',
  bkashType: 'Personal',
  nagadNumber: '01800-000000',
  nagadType: 'Personal',
  rocketNumber: '01900-000000',
  rocketType: 'Personal',
  bankDetails: 'Islami Bank Bangladesh Ltd, Mymensingh Branch, A/C: 20501234567890',
  emergencyContacts: [
    { id: 'ec_1', name: 'MMCH Blood Bank Office', phone: '091-66666', note: '24/7 Service' },
    { id: 'ec_2', name: 'Mymensingh Police Line', phone: '091-100', note: 'Control Room' },
    { id: 'ec_3', name: 'FBDM Ambulance / Emergency', phone: '01700-000000', note: 'On Call' }
  ],
  activeBannerNotice: 'জরুরী রক্তের প্রয়োজনে আমাদের ২৪/৭ হটলাইনে যোগাযোগ করুন অথবা তাৎক্ষণিক রিকুয়েস্ট পোস্ট করুন।',
  showBannerNotice: true,
  heroTitle: 'Be a Hero, Save Lives.',
  heroSubtitle: 'স্বেচ্ছায় রক্তদান করুন, জীবন বাঁচান। ময়মনসিংহ জেলার যেকোনো জরুরি রক্তের প্রয়োজনে আমরা আছি আপনার পাশে।',
  donationAppealText: 'Help fund emergency patient blood bags and community awareness.',
  aboutUsText: 'Friends Blood Donation Mymensingh (FBDM) ময়মনসিংহ জেলার বৃহত্তম স্বেচ্ছাসেবী রক্তদাতা নেটওয়ার্ক।',
  // Certificate & Card Customization
  certSignatoryName1: 'Dr. K. R. Mymensingh',
  certSignatoryTitle1: 'President, Central Executive Committee',
  certSignatoryName2: 'Md. Jahirul Islam',
  certSignatoryTitle2: 'General Secretary, FBDM',
  certFounderName: 'Arif Ahmed (Founder & Chief Patron)',
  certSealText: 'FBDM VERIFIED OFFICIAL SEAL',
  cardIssuerTitle: 'Central Donor Registration Authority, FBDM',
  cardHospitalHotline: 'MMCH Blood Bank: +880 1700-000000',
  leaderboardTitle: 'Top Blood Donors Leaderboard',
  leaderboardAnnouncement: 'ময়মনসিংহ জেলার সর্বোচ্চ রক্তদাতাদের সম্মানিত স্বীকৃতি',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Main Admin'
};

export const verifyAdminCredentials = (
  email: string, 
  password: string, 
  currentUser?: User | null
): { isValid: boolean; adminUser?: User; message?: string } => {
  if (!email || !email.trim()) return { isValid: false, message: 'এডমিন ইমেইল প্রদান করুন।' };
  if (!password || !password.trim()) return { isValid: false, message: 'এডমিন পাসওয়ার্ড প্রদান করুন।' };
  
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check default Main Admin
  if (cleanEmail === 'admin@fbdm.com' && cleanPass === 'admin@ca.com') {
    return { isValid: true, adminUser: adminUser };
  }

  // 2. Check registered accounts in localStorage
  try {
    const localAccounts: { user: User; password?: string }[] = JSON.parse(
      localStorage.getItem('fbdm_registered_accounts') || '[]'
    );

    const matched = localAccounts.find(
      acc => acc.user.email?.toLowerCase() === cleanEmail &&
             acc.password === cleanPass &&
             (acc.user.role === UserRole.ADMIN || acc.user.role === UserRole.MAIN_ADMIN)
    );

    if (matched) {
      return { isValid: true, adminUser: matched.user };
    }

    // Check by mobile if user entered mobile as identifier
    const matchedMobile = localAccounts.find(
      acc => (acc.user.mobile === cleanEmail || acc.user.mobile === cleanEmail.replace(/\D/g, '')) &&
             acc.password === cleanPass &&
             (acc.user.role === UserRole.ADMIN || acc.user.role === UserRole.MAIN_ADMIN)
    );
    if (matchedMobile) {
      return { isValid: true, adminUser: matchedMobile.user };
    }
  } catch (e) {
    console.warn("verifyAdminCredentials error:", e);
  }

  // 3. Current user check if already an admin
  if (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MAIN_ADMIN)) {
    if (currentUser.email?.toLowerCase() === cleanEmail && cleanPass === 'admin@ca.com') {
      return { isValid: true, adminUser: currentUser };
    }
  }

  return { isValid: false, message: 'ভুল এডমিন ইমেইল অথবা পাসওয়ার্ড!' };
};

export const verifyAdminPassword = (password: string, currentUser?: User | null): boolean => {
  if (!password || !password.trim()) return false;
  const cleanPass = password.trim();
  
  // 1. Check default main admin password
  if (cleanPass === 'admin@ca.com') return true;

  // 2. Check registered local accounts for this user or any admin user
  try {
    const localAccounts: { user: User; password?: string }[] = JSON.parse(
      localStorage.getItem('fbdm_registered_accounts') || '[]'
    );
    if (currentUser) {
      const matched = localAccounts.find(
        acc => (acc.user.id === currentUser.id || 
                acc.user.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
                acc.user.mobile === currentUser.mobile) &&
               acc.password === cleanPass
      );
      if (matched) return true;
    }

    // Check if any admin account has this password
    const adminAcc = localAccounts.find(
      acc => (acc.user.role === UserRole.ADMIN || acc.user.role === UserRole.MAIN_ADMIN) &&
             acc.password === cleanPass
    );
    if (adminAcc) return true;
  } catch (e) {
    console.warn("verifyAdminPassword error:", e);
  }

  return false;
};

// 30-Day Audit Log Manager
export const getActiveAuditLogs = (): any[] => {
  try {
    const raw = localStorage.getItem('fbdm_audit_history');
    if (!raw) return [];
    const logs = JSON.parse(raw);
    const now = new Date().getTime();
    // Keep logs for 30 days only
    const active = logs.filter((log: any) => {
      const logTime = new Date(log.timestamp).getTime();
      return (now - logTime) <= (30 * 24 * 60 * 60 * 1000);
    });
    if (active.length !== logs.length) {
      localStorage.setItem('fbdm_audit_history', JSON.stringify(active));
    }
    return active;
  } catch (e) {
    return [];
  }
};

export const addAuditLog = (logData: {
  adminEmail: string;
  adminName: string;
  adminRole: UserRole;
  action: any;
  details: string;
  targetId?: string;
}) => {
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const newLog = {
    ...logData,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now.toISOString(),
    expiryTimestamp: expiry.toISOString()
  };
  try {
    const current = getActiveAuditLogs();
    const updated = [newLog, ...current];
    localStorage.setItem('fbdm_audit_history', JSON.stringify(updated));
  } catch (e) {}
  return newLog;
};

export interface DonationEligibility {
  isEligible: boolean;
  effectiveAvailability: boolean;
  daysRemaining: number;
  daysSinceLast: number | null;
  nextEligibleDateStr: string | null;
  statusBadge: {
    text: string;
    subText: string;
    isAvailable: boolean;
    colorClass: string;
  };
}

export const checkDonationEligibility = (
  lastDonationDate: string | null | undefined, 
  isAvailablePref: boolean = true
): DonationEligibility => {
  if (!lastDonationDate || !String(lastDonationDate).trim()) {
    return {
      isEligible: true,
      effectiveAvailability: isAvailablePref,
      daysRemaining: 0,
      daysSinceLast: null,
      nextEligibleDateStr: null,
      statusBadge: {
        text: isAvailablePref ? 'রক্তদানে প্রস্তুত (Available)' : 'ব্যক্তিগত বিরতি',
        subText: isAvailablePref ? 'যেকোনো সময় রক্তদান করতে পারেন' : 'ডোনার সাময়িক অফলাইনে আছেন',
        isAvailable: isAvailablePref,
        colorClass: isAvailablePref ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
      }
    };
  }

  // Robust date comparison without timezone drift
  let lastYear: number, lastMonth: number, lastDay: number;
  const rawStr = String(lastDonationDate).trim();
  if (rawStr.includes('-')) {
    const parts = rawStr.split('T')[0].split('-');
    lastYear = parseInt(parts[0], 10);
    lastMonth = parseInt(parts[1], 10) - 1;
    lastDay = parseInt(parts[2], 10);
  } else {
    const d = new Date(rawStr);
    lastYear = d.getFullYear();
    lastMonth = d.getMonth();
    lastDay = d.getDate();
  }

  if (isNaN(lastYear) || isNaN(lastMonth) || isNaN(lastDay)) {
    return {
      isEligible: true,
      effectiveAvailability: isAvailablePref,
      daysRemaining: 0,
      daysSinceLast: null,
      nextEligibleDateStr: null,
      statusBadge: {
        text: isAvailablePref ? 'রক্তদানে প্রস্তুত' : 'ব্যক্তিগত বিরতি',
        subText: 'রক্তদান করতে পারেন',
        isAvailable: isAvailablePref,
        colorClass: isAvailablePref ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
      }
    };
  }

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const lastMidnight = new Date(lastYear, lastMonth, lastDay, 0, 0, 0, 0);

  const diffMs = todayMidnight.getTime() - lastMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const MIN_DAYS = 90; // 90 days (3 months) standard medical interval

  if (diffDays < MIN_DAYS) {
    // Has donated within last 90 days (or today, or tomorrow/future)
    const effectiveElapsed = Math.max(0, diffDays);
    const daysRemaining = Math.max(1, MIN_DAYS - effectiveElapsed);
    const nextDate = new Date(lastMidnight.getTime() + MIN_DAYS * 24 * 60 * 60 * 1000);
    const yyyy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    return {
      isEligible: false,
      effectiveAvailability: false,
      daysRemaining,
      daysSinceLast: diffDays,
      nextEligibleDateStr: dateStr,
      statusBadge: {
        text: `অপেক্ষমান (${daysRemaining} দিন বাকি)`,
        subText: `${diffDays <= 0 ? 'আজ' : `${diffDays} দিন আগে`} রক্ত দিয়েছেন। পরবর্তী রক্তদান: ${dateStr}`,
        isAvailable: false,
        colorClass: 'bg-amber-100 text-amber-800 border-amber-300'
      }
    };
  } else {
    // 90 or more days have passed
    return {
      isEligible: true,
      effectiveAvailability: isAvailablePref,
      daysRemaining: 0,
      daysSinceLast: diffDays,
      nextEligibleDateStr: null,
      statusBadge: {
        text: isAvailablePref ? 'রক্তদানে প্রস্তুত (Available)' : 'ব্যক্তিগত বিরতি',
        subText: `${diffDays} দিন আগে রক্ত দিয়েছেন (রক্তদানে প্রস্তুত)`,
        isAvailable: isAvailablePref,
        colorClass: isAvailablePref ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
      }
    };
  }
};

