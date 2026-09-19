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
  AlertCircle
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
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
import { adminUser, initialDonors } from '../store';

interface AuthProps {
  onLogin: (user: User) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const MYMENSINGH_UPAZILAS = [
  'Sadar',
  'Trishal',
  'Muktagacha',
  'Bhaluka',
  'Fulbaria',
  'Gafargaon',
  'Gauripur',
  'Haluaghat',
  'Ishwarganj',
  'Dhobaura',
  'Nandail',
  'Tara Khanda'
];

const AuthView: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('admin@fbdm.com');
  const [loginPassword, setLoginPassword] = useState('admin@ca.com');

  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupBloodGroup, setSignupBloodGroup] = useState<BloodGroup>('A+');
  const [signupUpazila, setSignupUpazila] = useState('Sadar');
  const [signupAddress, setSignupAddress] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Normalize phone number helper
  const normalizePhone = (num: string): string => {
    return num.replace(/\s+/g, '').replace(/-/g, '');
  };

  // Quick autofill for admin credentials
  const fillAdminCredentials = () => {
    setMode('LOGIN');
    setLoginIdentifier('admin@fbdm.com');
    setLoginPassword('admin@ca.com');
    setError(null);
  };

  // Handle Login using either Mobile Number or Email + Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const identifier = loginIdentifier.trim();
    const password = loginPassword;

    if (!identifier || !password) {
      setError('Please enter your mobile number or email, and your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check for requested Admin Credentials first:
      const isAdminLogin = 
        (identifier.toLowerCase() === 'admin@fbdm.com' || identifier === '01700000000') &&
        password === 'admin@ca.com';

      if (isAdminLogin) {
        if (isFirebaseConfigured) {
          try {
            await signInWithEmailAndPassword(auth, 'admin@fbdm.com', 'admin@ca.com');
          } catch (firebaseErr: any) {
            if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
              try {
                const res = await createUserWithEmailAndPassword(auth, 'admin@fbdm.com', 'admin@ca.com');
                await setDoc(doc(db, "users", res.user.uid), adminUser);
              } catch (createErr) {
                console.warn("Firebase admin creation skipped:", createErr);
              }
            }
          }
        }

        // Complete Admin Login immediately
        localStorage.setItem('fbdm_current_user', JSON.stringify(adminUser));
        setSuccessMsg('Welcome, Admin! Access granted.');
        setTimeout(() => {
          onLogin(adminUser);
        }, 300);
        return;
      }

      // 2. Identify if input is Email or Mobile Number
      let resolvedEmail = identifier;
      const isEmail = identifier.includes('@');
      const cleanPhone = normalizePhone(identifier);

      let authenticatedProfile: User | null = null;

      // 3. Try Firebase Auth if configured
      if (isFirebaseConfigured) {
        try {
          if (!isEmail) {
            // Find registered email by mobile from Firestore
            try {
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("mobile", "==", cleanPhone));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const userData = snap.docs[0].data() as User;
                if (userData.email) resolvedEmail = userData.email;
              }
            } catch (e) {
              console.warn("Firestore mobile search warning:", e);
            }
          }

          const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
          const fbUser = userCredential.user;

          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              authenticatedProfile = { id: fbUser.uid, ...userDoc.data() } as User;
            }
          } catch (docErr) {
            console.warn("Could not read user doc from Firestore:", docErr);
          }

          if (!authenticatedProfile) {
            authenticatedProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || 'FBDM Member',
              role: resolvedEmail === 'admin@fbdm.com' ? UserRole.MAIN_ADMIN : UserRole.USER,
              bloodGroup: 'A+',
              division: 'Mymensingh',
              district: 'Mymensingh',
              upazila: 'Sadar',
              address: 'Mymensingh',
              mobile: !isEmail ? identifier : '01700000000',
              whatsapp: !isEmail ? identifier : '01700000000',
              email: resolvedEmail,
              lastDonationDate: null,
              isAvailable: true,
              isApproved: true,
              donationsCount: 0
            };
            try {
              await setDoc(doc(db, "users", fbUser.uid), authenticatedProfile);
            } catch (setErr) {
              console.warn("Could not write user doc to Firestore:", setErr);
            }
          }
        } catch (authError: any) {
          console.warn("Firebase signIn warning:", authError?.code || authError?.message);
          if (authError.code === 'auth/wrong-password') {
            throw new Error('Incorrect password. Please try again.');
          }
        }
      }

      // 4. If not logged in yet, check local registered accounts & fallback donors
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
            throw new Error('Incorrect password. Please try again.');
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
              throw new Error('No registered account found with this email or mobile number. Please check or create an account.');
            }
          }
        }
      }

      if (authenticatedProfile) {
        localStorage.setItem('fbdm_current_user', JSON.stringify(authenticatedProfile));
        onLogin(authenticatedProfile);
      }
    } catch (err: any) {
      console.error("Login process error:", err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Account Registration
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
        throw new Error('This email is already registered. Please log in instead.');
      }

      const phoneExists = localAccounts.some(acc => normalizePhone(acc.user.mobile) === phone) ||
                          localUsers.some(u => normalizePhone(u.mobile) === phone);
      if (phoneExists) {
        throw new Error('This mobile number is already registered. Please log in instead.');
      }

      let userId = `user_${Date.now()}`;

      // Only attempt Firebase Auth if configured
      if (isFirebaseConfigured) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          userId = userCredential.user.uid;
        } catch (fbAuthErr: any) {
          console.warn("Firebase signup warning:", fbAuthErr?.code || fbAuthErr?.message);
          if (fbAuthErr.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered. Please log in instead.');
          }
          // If api key not valid or network error, do not block signup!
        }
      }

      const newUser: User = {
        id: userId,
        name,
        role: UserRole.USER,
        bloodGroup: signupBloodGroup,
        division: 'Mymensingh',
        district: 'Mymensingh',
        upazila: signupUpazila,
        address: signupAddress.trim() || `${signupUpazila}, Mymensingh`,
        mobile: phone,
        whatsapp: phone,
        email,
        lastDonationDate: null,
        isAvailable: true,
        isApproved: true,
        donationsCount: 0
      };

      // Save user to Firestore if configured
      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, "users", userId), newUser);
        } catch (firestoreErr) {
          console.warn("Could not save user to Firestore:", firestoreErr);
        }
      }

      // Save user in local registered accounts store (with password for local authentication)
      localAccounts.push({ user: newUser, password });
      localStorage.setItem('fbdm_registered_accounts', JSON.stringify(localAccounts));

      // Save user in local registered users store
      localUsers.push(newUser);
      localStorage.setItem('fbdm_registered_users', JSON.stringify(localUsers));
      localStorage.setItem('fbdm_current_user', JSON.stringify(newUser));

      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLogin(newUser);
      }, 500);

    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200 border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-red-200">
            <Heart className="fill-white" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">FBDM</h1>
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-0.5">Free Blood Donation Mymensingh</p>
          <p className="text-xs text-slate-500 mt-2">
            {mode === 'LOGIN' 
              ? 'Login with your Mobile Number or Email & Password' 
              : 'Register as a donor or recipient in Mymensingh'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'LOGIN' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('SIGNUP'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'SIGNUP' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Admin Quick Fill Banner */}
        {mode === 'LOGIN' && (
          <div className="mb-5 p-3.5 bg-red-50/80 rounded-2xl border border-red-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-[11px] font-bold text-slate-800">Admin Account Ready</p>
                <p className="text-[10px] text-slate-600 font-mono">admin@fbdm.com</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[11px] font-bold shadow hover:bg-red-700 active:scale-95 transition-all flex-shrink-0"
            >
              Fill Credentials
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-100 text-green-700 text-xs rounded-2xl flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode 1: LOGIN */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
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
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin@fbdm.com or 017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">Default: admin@ca.com</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
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
              className="w-full mt-2 bg-red-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={20} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('SIGNUP'); setError(null); }}
                className="font-bold text-red-600 hover:underline ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: SIGN UP */
          <form onSubmit={handleSignUp} className="space-y-3.5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-3 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Upazila
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    id="signup-upazila"
                    value={signupUpazila}
                    onChange={(e) => setSignupUpazila(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-3 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    {MYMENSINGH_UPAZILAS.map(upz => (
                      <option key={upz} value={upz}>{upz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Address / Area
                </label>
                <input
                  id="signup-address"
                  type="text"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  placeholder="e.g. Town Hall Area"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-red-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={20} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('LOGIN'); setError(null); }}
                className="font-bold text-red-600 hover:underline ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthView;
