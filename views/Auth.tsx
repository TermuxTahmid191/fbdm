import React, { useState } from 'react';
import { 
  Heart, 
  Phone, 
  Mail, 
  Lock, 
  User as UserIcon, 
  MapPin, 
  Droplet, 
  ArrowRight, 
  LoaderCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebaseConfig';
import { User, UserRole, BloodGroup } from '../types';
import { adminUser, initialDonors, checkDonationEligibility } from '../store';
import { 
  BANGLADESH_DATA, 
  DIVISIONS, 
  getDistrictsOfDivision, 
  getUpazilasOfDistrict 
} from '../bangladeshData';

interface AuthProps {
  onLogin: (user: User) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

type AuthMode = 'USER_LOGIN' | 'ADMIN_LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

const AuthView: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('USER_LOGIN');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Forgot Password States
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupBloodGroup, setSignupBloodGroup] = useState<BloodGroup>('A+');
  const [signupDivision, setSignupDivision] = useState('Mymensingh');
  const [signupDistrict, setSignupDistrict] = useState('Mymensingh');
  const [signupUpazila, setSignupUpazila] = useState('Mymensingh Sadar');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupLastDonationDate, setSignupLastDonationDate] = useState('');
  const [neverDonatedBefore, setNeverDonatedBefore] = useState(false);
  const [signupDonationsCount, setSignupDonationsCount] = useState<number>(1);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unregisteredPrompt, setUnregisteredPrompt] = useState<{
    identifier: string;
    password: string;
    isEmail: boolean;
  } | null>(null);

  // Helper with timeout to prevent Firebase calls from hanging indefinitely
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs = 4500): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout - proceeding with local profile')), timeoutMs)
      )
    ]);
  };

  const normalizePhone = (num: string): string => {
    return num.replace(/\s+/g, '').replace(/-/g, '');
  };

  const switchToSignupWithPrefill = () => {
    const isEmail = loginIdentifier.includes('@');
    if (isEmail) {
      setSignupEmail(loginIdentifier);
      const prefix = loginIdentifier.split('@')[0].replace(/[._-]/g, ' ');
      if (!fullName) {
        setFullName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
      }
    } else if (loginIdentifier.trim()) {
      setSignupMobile(loginIdentifier);
    }
    if (loginPassword) {
      setSignupPassword(loginPassword);
    }
    setMode('SIGNUP');
    setError(null);
    setUnregisteredPrompt(null);
  };

  // Quick Register and sign in
  const handleQuickRegister = async (targetId?: string, targetPass?: string) => {
    const rawId = (targetId || loginIdentifier).trim();
    const rawPass = targetPass || loginPassword || 'fbdm1234';

    if (!rawId) {
      setError('Please enter your email or mobile number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUnregisteredPrompt(null);

    try {
      const isEmail = rawId.includes('@');
      const cleanPhone = !isEmail 
        ? normalizePhone(rawId) 
        : '017' + Math.floor(10000000 + Math.random() * 90000000);
      const email = isEmail ? rawId.toLowerCase() : `${cleanPhone}@fbdm.org`;
      const prefix = isEmail ? rawId.split('@')[0].replace(/[._-]/g, ' ') : `Donor ${cleanPhone.slice(-4)}`;
      const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const password = rawPass;

      let userId = `user_${Date.now()}`;

      if (isFirebaseConfigured) {
        try {
          const userCred = await withTimeout(createUserWithEmailAndPassword(auth, email, password));
          userId = userCred.user.uid;
        } catch (fbErr: any) {
          console.warn("Firebase quick register note:", fbErr?.message);
        }
      }

      const newUser: User = {
        id: userId,
        name,
        role: UserRole.USER,
        bloodGroup: 'O+',
        division: 'Mymensingh',
        district: 'Mymensingh',
        upazila: 'Sadar',
        address: 'Mymensingh Sadar',
        mobile: cleanPhone,
        whatsapp: cleanPhone,
        email,
        lastDonationDate: null,
        isAvailable: true,
        isApproved: true,
        donationsCount: 0
      };

      if (isFirebaseConfigured) {
        try {
          await withTimeout(setDoc(doc(db, "users", userId), newUser));
        } catch (e) {
          console.warn("Firestore save note:", e);
        }
      }

      const localAccounts: { user: User; password?: string }[] = JSON.parse(
        localStorage.getItem('fbdm_registered_accounts') || '[]'
      );
      localAccounts.push({ user: newUser, password });
      localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));

      const localUsers: User[] = JSON.parse(
        localStorage.getItem('fbdm_registered_users') || '[]'
      );
      localUsers.push(newUser);
      localStorage.setItem('fbdm_registered_users', JSON.stringify(localUsers));
      localStorage.setItem('fbdm_current_user', JSON.stringify(newUser));

      setSuccessMsg(`Welcome to FBDM, ${name}! Logged in successfully.`);
      setTimeout(() => {
        onLogin(newUser);
      }, 300);

    } catch (err: any) {
      setError(err.message || 'Quick registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // User Login Handler
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setUnregisteredPrompt(null);

    const identifier = loginIdentifier.trim();
    const password = loginPassword;

    if (!identifier || !password) {
      setError('Please enter your mobile number or email, and your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Check Admin Credentials shortcut
      if (
        (identifier.toLowerCase() === 'admin@fbdm.com' || identifier === '01700000000') &&
        password === 'admin@ca.com'
      ) {
        localStorage.setItem('fbdm_current_user', JSON.stringify(adminUser));
        setSuccessMsg('Welcome, Admin! Access granted.');
        setTimeout(() => onLogin(adminUser), 200);
        return;
      }

      const isEmail = identifier.includes('@');
      const cleanPhone = normalizePhone(identifier);
      let authenticatedProfile: User | null = null;
      let resolvedEmail = isEmail ? identifier.toLowerCase() : '';

      // Try Firebase Auth if configured and input is email
      if (isFirebaseConfigured && isEmail) {
        try {
          const userCredential = await withTimeout(signInWithEmailAndPassword(auth, resolvedEmail, password));
          const fbUser = userCredential.user;
          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              authenticatedProfile = { id: fbUser.uid, ...userDoc.data() } as User;
            }
          } catch (docErr) {
            console.warn("Could not read user doc:", docErr);
          }
          if (!authenticatedProfile) {
            authenticatedProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || identifier.split('@')[0],
              role: UserRole.USER,
              bloodGroup: 'A+',
              division: 'Mymensingh',
              district: 'Mymensingh',
              upazila: 'Sadar',
              address: 'Mymensingh',
              mobile: '01700000000',
              whatsapp: '01700000000',
              email: resolvedEmail,
              lastDonationDate: null,
              isAvailable: true,
              isApproved: true,
              donationsCount: 0
            };
          }
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            throw new Error('ভুল পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন বা Forgot Password ব্যবহার করুন।');
          }
        }
      }

      // If not authenticated via Firebase yet, check local accounts
      if (!authenticatedProfile) {
        const localAccounts: { user: User; password?: string }[] = JSON.parse(
          localStorage.getItem('fbdm_registered_accounts') || '[]'
        );

        const match = localAccounts.find(acc => 
          (acc.user.email && acc.user.email.toLowerCase() === identifier.toLowerCase()) ||
          normalizePhone(acc.user.mobile) === cleanPhone ||
          normalizePhone(acc.user.whatsapp) === cleanPhone
        );

        if (match) {
          if (match.password && match.password !== password) {
            throw new Error('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
          }
          authenticatedProfile = match.user;
        } else {
          // Check local registered users list
          const localUsers: User[] = JSON.parse(localStorage.getItem('fbdm_registered_users') || '[]');
          const userMatch = localUsers.find(u => 
            (u.email && u.email.toLowerCase() === identifier.toLowerCase()) || 
            normalizePhone(u.mobile) === cleanPhone ||
            normalizePhone(u.whatsapp) === cleanPhone
          );

          if (userMatch) {
            authenticatedProfile = userMatch;
          } else {
            // Check initial donors
            const donorMatch = initialDonors.find(u => 
              (u.email && u.email.toLowerCase() === identifier.toLowerCase()) || 
              normalizePhone(u.mobile) === cleanPhone ||
              normalizePhone(u.whatsapp) === cleanPhone
            );
            if (donorMatch) {
              authenticatedProfile = donorMatch;
            } else {
              setUnregisteredPrompt({ identifier, password, isEmail });
              return;
            }
          }
        }
      }

      if (authenticatedProfile) {
        localStorage.setItem('fbdm_current_user', JSON.stringify(authenticatedProfile));
        setSuccessMsg(`Welcome, ${authenticatedProfile.name}!`);
        setTimeout(() => onLogin(authenticatedProfile!), 200);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Dedicated Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword;

    if (!email || !password) {
      setError('Please enter Admin email and password.');
      setIsLoading(false);
      return;
    }

    try {
      if (email === 'admin@fbdm.com' && password === 'admin@ca.com') {
        if (isFirebaseConfigured) {
          try {
            await withTimeout(signInWithEmailAndPassword(auth, 'admin@fbdm.com', 'admin@ca.com'), 3000);
          } catch (e: any) {
            if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
              try {
                const res = await createUserWithEmailAndPassword(auth, 'admin@fbdm.com', 'admin@ca.com');
                await setDoc(doc(db, "users", res.user.uid), adminUser);
              } catch (createErr) {
                console.warn("Firebase admin creation skipped:", createErr);
              }
            }
          }
        }

        localStorage.setItem('fbdm_current_user', JSON.stringify(adminUser));
        setSuccessMsg('🛡️ Administrator verified! Entering Admin Console...');
        setTimeout(() => onLogin(adminUser), 200);
        return;
      }

      // Check if another admin user was registered or promoted
      const registeredUsers: User[] = JSON.parse(
        localStorage.getItem('fbdm_registered_users') || '[]'
      );
      const localAccounts: { user: User; password?: string }[] = JSON.parse(
        localStorage.getItem('fbdm_registered_accounts') || '[]'
      );

      // Find user by email or mobile
      const matchedAccount = localAccounts.find(acc => 
        acc.user.email?.toLowerCase() === email || 
        acc.user.mobile === email || 
        acc.user.mobile?.replace(/\D/g, '') === email.replace(/\D/g, '')
      );

      if (matchedAccount && matchedAccount.password === password) {
        // Check latest role from registeredUsers list or matchedAccount
        const latestProfile = registeredUsers.find(u => u.id === matchedAccount.user.id) || matchedAccount.user;
        if (latestProfile.role === UserRole.ADMIN || latestProfile.role === UserRole.MAIN_ADMIN) {
          localStorage.setItem('fbdm_current_user', JSON.stringify(latestProfile));
          setSuccessMsg('🛡️ Administrator verified!');
          setTimeout(() => onLogin(latestProfile), 200);
          return;
        }
      }

      // Try Firebase authentication for admin email if configured
      if (isFirebaseConfigured && email.includes('@')) {
        try {
          const cred = await withTimeout(signInWithEmailAndPassword(auth, email, password), 4000);
          const userDoc = await getDoc(doc(db, "users", cred.user.uid));
          if (userDoc.exists()) {
            const fbProfile = { id: cred.user.uid, ...userDoc.data() } as User;
            if (fbProfile.role === UserRole.ADMIN || fbProfile.role === UserRole.MAIN_ADMIN) {
              localStorage.setItem('fbdm_current_user', JSON.stringify(fbProfile));
              setSuccessMsg('🛡️ Administrator verified!');
              setTimeout(() => onLogin(fbProfile), 200);
              return;
            }
          }
        } catch (fbErr) {}
      }

      throw new Error('Invalid Admin Credentials. Please check your admin email and password.');
    } catch (err: any) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    setIsLoading(true);

    const identifier = resetIdentifier.trim();
    if (!identifier) {
      setError('অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল বা মোবাইল নাম্বার লিখুন।');
      setIsLoading(false);
      return;
    }

    const isEmail = identifier.includes('@');
    try {
      if (isEmail && isFirebaseConfigured) {
        try {
          await withTimeout(sendPasswordResetEmail(auth, identifier));
          setResetSuccess(`✅ আপনার ইমেইল (${identifier}) এ একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।`);
          setIsLoading(false);
          return;
        } catch (fbErr: any) {
          console.warn("Firebase password reset notice:", fbErr?.message);
        }
      }

      // Local account password update
      const localAccounts: { user: User; password?: string }[] = JSON.parse(
        localStorage.getItem('fbdm_registered_accounts') || '[]'
      );
      const cleanPhone = normalizePhone(identifier);
      const accIndex = localAccounts.findIndex(acc => 
        (acc.user.email && acc.user.email.toLowerCase() === identifier.toLowerCase()) ||
        normalizePhone(acc.user.mobile) === cleanPhone
      );

      if (accIndex !== -1) {
        if (newResetPassword.length >= 6) {
          localAccounts[accIndex].password = newResetPassword;
          localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));
          setResetSuccess(`✅ পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।`);
          setTimeout(() => {
            setLoginIdentifier(identifier);
            setLoginPassword(newResetPassword);
            setMode('USER_LOGIN');
          }, 1500);
        } else {
          setResetSuccess(`✅ আপনার অ্যাকাউন্ট "${localAccounts[accIndex].user.name}" পাওয়া গেছে। নিচে একটি নতুন ৬ অক্ষরের পাসওয়ার্ড লিখে সেভ করুন।`);
        }
      } else {
        if (isEmail) {
          setResetSuccess(`✅ পাসওয়ার্ড রিসেট নির্দেশিকা আপনার ইমেইলে (${identifier}) পাঠানো হয়েছে।`);
        } else {
          setError('এই মোবাইল নাম্বারে কোনো রেজিস্টার্ড একাউন্ট খুঁজে পাওয়া যায়নি।');
        }
      }
    } catch (err: any) {
      setError(err.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const name = fullName.trim();
    const phone = normalizePhone(signupMobile.trim());
    const email = signupEmail.trim();
    const password = signupPassword;

    if (!name || !phone || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (phone.length < 11) {
      setError('Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!neverDonatedBefore && !signupLastDonationDate) {
      setError('অনুগ্রহ করে আপনার সর্বশেষ রক্তদানের তারিখ দিন অথবা "পূর্বে কখনো রক্ত দেইনি" অপশনটি বেছে নিন।');
      return;
    }

    let initialLastDonationDate: string | null = null;
    let initialDonationsCount = 0;
    let initialIsAvailable = true;

    if (!neverDonatedBefore && signupLastDonationDate) {
      initialLastDonationDate = signupLastDonationDate;
      initialDonationsCount = Math.max(1, Number(signupDonationsCount) || 1);
      const eligibility = checkDonationEligibility(signupLastDonationDate, true);
      initialIsAvailable = eligibility.effectiveAvailability;
    }

    setIsLoading(true);

    try {
      const localAccounts: { user: User; password?: string }[] = JSON.parse(
        localStorage.getItem('fbdm_registered_accounts') || '[]'
      );
      const localUsers: User[] = JSON.parse(
        localStorage.getItem('fbdm_registered_users') || '[]'
      );

      const emailExists = localAccounts.some(acc => acc.user.email?.toLowerCase() === email.toLowerCase()) ||
                          localUsers.some(u => u.email?.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      const phoneExists = localAccounts.some(acc => normalizePhone(acc.user.mobile) === phone) ||
                          localUsers.some(u => normalizePhone(u.mobile) === phone);
      if (phoneExists) {
        throw new Error('This mobile number is already registered. Please sign in instead.');
      }

      let userId = `user_${Date.now()}`;

      // Firebase Auth attempt with short timeout to prevent slow hanging
      if (isFirebaseConfigured) {
        try {
          const userCredential = await withTimeout(
            createUserWithEmailAndPassword(auth, email, password),
            4000
          );
          userId = userCredential.user.uid;
        } catch (fbAuthErr: any) {
          console.warn("Firebase signup notice:", fbAuthErr?.message);
          if (fbAuthErr.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered in Firebase. Please sign in.');
          }
        }
      }

      const newUser: User = {
        id: userId,
        name,
        role: UserRole.USER,
        bloodGroup: signupBloodGroup,
        division: signupDivision,
        district: signupDistrict,
        upazila: signupUpazila,
        address: signupAddress.trim() || `${signupUpazila}, ${signupDistrict}`,
        mobile: phone,
        whatsapp: phone,
        email,
        lastDonationDate: initialLastDonationDate,
        isAvailable: initialIsAvailable,
        isApproved: true,
        donationsCount: initialDonationsCount
      };

      // Save user to Firestore asynchronously
      if (isFirebaseConfigured) {
        withTimeout(setDoc(doc(db, "users", userId), newUser), 3000)
          .catch(e => console.warn("Firestore write notice:", e));
      }

      // Save user locally
      localAccounts.push({ user: newUser, password });
      localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));

      localUsers.push(newUser);
      localStorage.setItem('fbdm_registered_users', JSON.stringify(localUsers));
      localStorage.setItem('fbdm_current_user', JSON.stringify(newUser));

      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLogin(newUser);
      }, 300);

    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-xl shadow-slate-200 border border-slate-100 max-h-[92vh] overflow-y-auto hide-scrollbar">
        
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-3 shadow-lg shadow-red-200">
            <Heart className="fill-white" size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">FBDM</h1>
          <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mt-0.5">Free Blood Donation Mymensingh</p>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'USER_LOGIN' && 'Sign in to access your donor account'}
            {mode === 'ADMIN_LOGIN' && '🛡️ FBDM Administrator Control Console'}
            {mode === 'SIGNUP' && 'Register as a life-saving donor in Mymensingh'}
            {mode === 'FORGOT_PASSWORD' && 'পাসওয়ার্ড রিসেট বা উদ্ধার করুন'}
          </p>
        </div>

        {/* 3-Way Mode Switcher (User Login | Admin Login | Sign Up) */}
        {mode !== 'FORGOT_PASSWORD' && (
          <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl mb-5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setMode('USER_LOGIN'); setError(null); setUnregisteredPrompt(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'USER_LOGIN' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('ADMIN_LOGIN'); setError(null); setUnregisteredPrompt(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                mode === 'ADMIN_LOGIN' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck size={13} className="text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={switchToSignupWithPrefill}
              className={`py-2 rounded-xl transition-all ${
                mode === 'SIGNUP' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Unregistered Account Smart Action */}
        {unregisteredPrompt && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl animate-in fade-in space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900">
                  No account found for "{unregisteredPrompt.identifier}"
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Would you like to quickly register this {unregisteredPrompt.isEmail ? 'email' : 'mobile number'} as a donor and sign in?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleQuickRegister(unregisteredPrompt.identifier, unregisteredPrompt.password)}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>⚡ Quick Register & Sign In</span>
              </button>
              <button
                type="button"
                onClick={switchToSignupWithPrefill}
                className="py-2 px-3 bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-200 rounded-xl text-xs font-semibold transition-all text-center"
              >
                Full Profile
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-2xl flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* MODE 1: USER LOGIN */}
        {mode === 'USER_LOGIN' && (
          <form onSubmit={handleUserLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {loginIdentifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                </div>
                <input
                  id="auth-identifier"
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (unregisteredPrompt) setUnregisteredPrompt(null);
                  }}
                  placeholder="user@example.com or 017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetIdentifier(loginIdentifier);
                    setMode('FORGOT_PASSWORD');
                    setError(null);
                  }}
                  className="text-[11px] font-bold text-red-600 hover:underline"
                >
                  Forgot Password? (পাসওয়ার্ড ভুলে গেছেন?)
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (unregisteredPrompt) setUnregisteredPrompt(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-12 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-red-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={switchToSignupWithPrefill}
                className="font-bold text-red-600 hover:underline"
              >
                Create Account →
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: ADMIN DEDICATED LOGIN */}
        {mode === 'ADMIN_LOGIN' && (
          <form onSubmit={handleAdminLogin} className="space-y-3.5 animate-in fade-in">
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-white">Administrator Portal</p>
                <p className="text-slate-400 text-[10px]">Manage blood requests, donations & members</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-12 text-sm font-medium outline-none focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>


            <button
              id="admin-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-slate-300 hover:bg-black active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-slate-600"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Authorizing Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} className="text-amber-400" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 3: SIGN UP */}
        {mode === 'SIGNUP' && (
          <form onSubmit={handleSignUp} className="space-y-3 animate-in fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arif Ahmed"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="signup-phone"
                    type="tel"
                    required
                    value={signupMobile}
                    onChange={(e) => setSignupMobile(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-11 pr-3 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Blood Group
                </label>
                <div className="relative">
                  <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                  <select
                    id="signup-blood-group"
                    value={signupBloodGroup}
                    onChange={(e) => setSignupBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-12 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Location: Division, District, Upazila & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  বিভাগ (Division)
                </label>
                <select
                  id="signup-division"
                  value={signupDivision}
                  onChange={(e) => {
                    const newDiv = e.target.value;
                    setSignupDivision(newDiv);
                    const dists = getDistrictsOfDivision(newDiv);
                    const firstDist = dists[0] || '';
                    setSignupDistrict(firstDist);
                    const upzs = getUpazilasOfDistrict(newDiv, firstDist);
                    setSignupUpazila(upzs[0] || '');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 text-xs font-bold outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {DIVISIONS.map(divKey => {
                    const divData = BANGLADESH_DATA[divKey];
                    return (
                      <option key={divKey} value={divKey}>
                        {divData?.bnName || divKey} ({divKey})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  জেলা (District)
                </label>
                <select
                  id="signup-district"
                  value={signupDistrict}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setSignupDistrict(newDist);
                    const upzs = getUpazilasOfDistrict(signupDivision, newDist);
                    setSignupUpazila(upzs[0] || '');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 text-xs font-bold outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {getDistrictsOfDivision(signupDivision).map(dist => {
                    const dData = BANGLADESH_DATA[signupDivision]?.districts[dist];
                    return (
                      <option key={dist} value={dist}>
                        {dData?.bnName || dist} ({dist})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  উপজেলা (Upazila)
                </label>
                <select
                  id="signup-upazila"
                  value={signupUpazila}
                  onChange={(e) => setSignupUpazila(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 text-xs font-bold outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {getUpazilasOfDistrict(signupDivision, signupDistrict).map(upz => (
                    <option key={upz} value={upz}>{upz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                এলাকা / গ্রাম / রোড (Area / Village / Road)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="signup-address"
                  type="text"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি, বা টাউন হল মোড়"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-11 pr-3 text-xs font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            {/* Last Donation Date & Donations Count */}
            <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                  <Droplet size={13} className="text-red-600 fill-red-600" />
                  <span>রক্তদানের ইতিহাস (Donation History)</span>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={neverDonatedBefore}
                    onChange={(e) => {
                      setNeverDonatedBefore(e.target.checked);
                      if (e.target.checked) {
                        setSignupLastDonationDate('');
                        setSignupDonationsCount(0);
                      } else {
                        setSignupDonationsCount(1);
                      }
                    }}
                    className="w-3.5 h-3.5 text-red-600 rounded"
                  />
                  <span>পূর্বে কখনো রক্ত দেইনি</span>
                </label>
              </div>

              {!neverDonatedBefore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      সর্বশেষ রক্তদানের তারিখ *
                    </label>
                    <input
                      type="date"
                      required={!neverDonatedBefore}
                      value={signupLastDonationDate}
                      onChange={(e) => setSignupLastDonationDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      মোট কতবার রক্ত দিয়েছেন?
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={signupDonationsCount}
                      onChange={(e) => setSignupDonationsCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-red-500"
                      placeholder="যেমন: 1, 2, 5..."
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-red-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Registering Member...</span>
                </>
              ) : (
                <>
                  <span>Create Donor Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('USER_LOGIN'); setError(null); }}
                className="font-bold text-red-600 hover:underline ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* MODE 4: FORGOT PASSWORD */}
        {mode === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 animate-in fade-in">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setMode('USER_LOGIN'); setError(null); setResetSuccess(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">পাসওয়ার্ড পুনরুদ্ধার</h3>
                <p className="text-[11px] text-slate-500">Password Recovery & Reset</p>
              </div>
            </div>

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl leading-relaxed">
                {resetSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {resetIdentifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                </div>
                <input
                  type="text"
                  required
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="017XXXXXXXX or user@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                New Password (নতুন পাসওয়ার্ড)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-red-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Reset & Save Password</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('USER_LOGIN'); setError(null); }}
                className="text-xs font-bold text-slate-600 hover:text-red-600 hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Quick Guest Exploration */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              const guestUser: User = {
                id: `guest_${Date.now()}`,
                name: 'Guest Member',
                role: UserRole.USER,
                bloodGroup: 'O+',
                division: 'Mymensingh',
                district: 'Mymensingh',
                upazila: 'Sadar',
                address: 'Mymensingh Sadar',
                mobile: '01700000000',
                whatsapp: '01700000000',
                email: 'guest@fbdm.org',
                lastDonationDate: null,
                isAvailable: false,
                isApproved: true,
                donationsCount: 0
              };
              localStorage.setItem('fbdm_current_user', JSON.stringify(guestUser));
              onLogin(guestUser);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
          >
            <span>Just exploring the portal?</span>
            <span className="text-red-600 font-bold hover:underline">Explore as Guest →</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthView;
