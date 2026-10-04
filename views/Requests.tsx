import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Phone, 
  Hospital, 
  CheckCircle, 
  AlertTriangle, 
  Send,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { BloodRequest, User, BloodGroup } from '../types';

interface RequestProps {
  requests: BloodRequest[];
  user: User;
  onRequestCreated?: (request: BloodRequest) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const RequestView: React.FC<RequestProps> = ({ requests, user, onRequestCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'APPROVED' | 'MINE' | 'ALL'>('APPROVED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+' as BloodGroup,
    units: 1,
    hospitalName: '',
    location: '',
    requiredAt: '',
    contactNumber: user.mobile || '',
    isEmergency: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Generate unique ID that matches Firestore document ID
    const reqDocRef = isFirebaseConfigured ? doc(collection(db, "requests")) : null;
    const reqId = reqDocRef ? reqDocRef.id : `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newRequest: BloodRequest = {
      id: reqId,
      patientName: formData.patientName.trim(),
      bloodGroup: formData.bloodGroup,
      units: Number(formData.units),
      hospitalName: formData.hospitalName.trim(),
      location: formData.location.trim(),
      requiredAt: formData.requiredAt.trim(),
      contactNumber: formData.contactNumber.trim(),
      requestedBy: user.id,
      status: 'PENDING',
      isEmergency: formData.isEmergency,
      createdAt: new Date().toISOString()
    };

    // Update state immediately in app - zero delay
    onRequestCreated?.(newRequest);

    // Asynchronous background firestore sync
    if (isFirebaseConfigured && reqDocRef) {
      const savePromise = setDoc(reqDocRef, newRequest);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
      Promise.race([savePromise, timeoutPromise]).catch(err => {
        console.warn("Background Firestore request sync notice:", err);
      });
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitSuccess(false);
      setFormData({
        patientName: '',
        bloodGroup: 'A+' as BloodGroup,
        units: 1,
        hospitalName: '',
        location: '',
        requiredAt: '',
        contactNumber: user.mobile || '',
        isEmergency: false
      });
      setIsSubmitting(false);
      setFilter('MINE');
    }, 600);
  };

  const myRequests = requests.filter(r => r.requestedBy === user.id);
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');

  const filteredRequests = filter === 'MINE' 
    ? myRequests
    : filter === 'APPROVED'
    ? approvedRequests
    : requests;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Blood Requests</h2>
          <p className="text-xs text-slate-500">
            Emergency and scheduled patient requirements in Mymensingh
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:bg-red-700 active:scale-98 transition-all"
        >
          <Plus size={18} />
          <span>Post Blood Request</span>
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setFilter('APPROVED')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'APPROVED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Verified Requests ({approvedRequests.length})
        </button>
        <button
          onClick={() => setFilter('MINE')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
            filter === 'MINE'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Posts ({myRequests.length})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map(req => {
          const isMyPost = req.requestedBy === user.id;
          return (
            <div 
              key={req.id} 
              className={`bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${
                req.isEmergency ? 'border-red-200' : 'border-slate-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    req.isEmergency ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {req.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">{req.patientName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.units} UNIT{req.units > 1 && 'S'}</span>
                      {req.isEmergency && (
                        <span className="flex items-center gap-1 text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black">
                          <AlertTriangle size={9} /> EMERGENCY
                        </span>
                      )}
                      {isMyPost && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">
                          My Post
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    req.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-700' 
                      : req.status === 'REJECTED' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status === 'PENDING' ? 'Under Review' : req.status}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4 bg-slate-50/70 p-3 rounded-2xl text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Hospital size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{req.hospitalName}, {req.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>Required: <span className="font-bold text-slate-800">{req.requiredAt}</span></span>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`tel:${req.contactNumber}`} 
                  className="flex-1 bg-red-600 text-white flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100"
                >
                  <Phone size={14} /> 
                  <span>Call Attendant ({req.contactNumber})</span>
                </a>
              </div>
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 p-6">
            <CheckCircle size={44} className="mx-auto mb-3 opacity-20 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700">No requests in this view</h4>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'MINE' 
                ? "You haven't posted any blood requests yet." 
                : 'All requests have been fulfilled or none are currently pending.'}
            </p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[92vh] hide-scrollbar">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              ✕
            </button>

            <div className="mb-5">
              <h3 className="text-2xl font-black text-slate-800">Request Blood</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your post will be submitted for admin verification and sent to Mymensingh donors.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-4 mb-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>Blood request posted successfully! Awaiting admin review.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Patient Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.patientName} 
                  onChange={e => setFormData({...formData, patientName: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                  placeholder="Patient's full name" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Blood Group
                  </label>
                  <select 
                    value={formData.bloodGroup} 
                    onChange={e => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-red-600 outline-none focus:bg-white focus:border-red-400"
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Units Needed
                  </label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    max="10"
                    value={formData.units} 
                    onChange={e => setFormData({...formData, units: parseInt(e.target.value) || 1})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Hospital Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.hospitalName} 
                  onChange={e => setFormData({...formData, hospitalName: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                  placeholder="e.g. Mymensingh Medical College Hospital (MMCH)" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Location / Upazila
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                  placeholder="e.g. Charpara, Sadar, Mymensingh" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Required Date / Time
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.requiredAt} 
                    onChange={e => setFormData({...formData, requiredAt: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                    placeholder="e.g. Today 8:00 PM or ASAP" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Contact Phone Number
                  </label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.contactNumber} 
                    onChange={e => setFormData({...formData, contactNumber: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:bg-white focus:border-red-400" 
                    placeholder="017XXXXXXXX" 
                  />
                </div>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emergency-check"
                  checked={formData.isEmergency}
                  onChange={e => setFormData({...formData, isEmergency: e.target.checked})}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <label htmlFor="emergency-check" className="text-xs font-bold text-red-700 cursor-pointer">
                  🚨 This is an Emergency / Critical Request
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Request for Approval</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestView;
