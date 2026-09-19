
import React, { useState } from 'react';
import { Plus, Clock, MapPin, Phone, Hospital, Users, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [filter, setFilter] = useState<'ALL' | 'MINE'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+' as BloodGroup,
    units: 1,
    hospitalName: '',
    location: '',
    requiredAt: '',
    contactNumber: '',
    isEmergency: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRequest: BloodRequest = {
      id: `req_${Date.now()}`,
      patientName: formData.patientName,
      bloodGroup: formData.bloodGroup,
      units: Number(formData.units),
      hospitalName: formData.hospitalName,
      location: formData.location,
      requiredAt: formData.requiredAt,
      contactNumber: formData.contactNumber,
      requestedBy: user.id,
      status: 'PENDING',
      isEmergency: formData.isEmergency,
      createdAt: new Date().toISOString()
    };

    // Update state immediately
    onRequestCreated?.(newRequest);

    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, "requests"), {
          ...formData,
          units: Number(formData.units),
          requestedBy: user.id,
          status: 'PENDING',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.warn("Firestore request saving warning:", error);
      }
    }

    setShowModal(false);
    // Reset form
    setFormData({
      patientName: '',
      bloodGroup: 'A+' as BloodGroup,
      units: 1,
      hospitalName: '',
      location: '',
      requiredAt: '',
      contactNumber: '',
      isEmergency: false
    });
    setIsSubmitting(false);
  };


  const filteredRequests = filter === 'MINE' 
    ? requests.filter(r => r.requestedBy === user.id)
    : requests.filter(r => r.status === 'APPROVED' || r.requestedBy === user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">Blood Requests</h2>
          <p className="text-sm text-slate-500">Post or find urgent blood requirements.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Feed
        </button>
        <button 
          onClick={() => setFilter('MINE')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'MINE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Posts
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredRequests.map(req => (
          <div key={req.id} className={`bg-white rounded-3xl p-6 shadow-sm border ${req.isEmergency ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${req.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                  {req.bloodGroup}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">{req.patientName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.units} UNIT{req.units > 1 && 'S'}</span>
                    {req.isEmergency && (
                      <span className="flex items-center gap-1 text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black">
                        <AlertTriangle size={8} /> EMERGENCY
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${req.status === 'APPROVED' ? 'bg-green-100 text-green-600' : req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : req.status === 'FULFILLED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  {req.status}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent')}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <Hospital size={14} className="text-slate-400 mt-0.5" />
                <span>{req.hospitalName}, {req.location}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <Clock size={14} className="text-slate-400 mt-0.5" />
                <span>Required By: <span className="font-bold text-slate-800">{req.requiredAt}</span></span>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={`tel:${req.contactNumber}`} className="flex-1 bg-red-600 text-white flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100">
                <Phone size={14} /> Call Attendant
              </a>
              <button className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-slate-200 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
              <Plus size={24} className="rotate-45" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Request Blood</h3>
            <p className="text-sm text-slate-500 mb-6">Fill in patient details for approval.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Patient Name</label>
                <input required type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="Patient's full name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100">
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Units Needed</label>
                  <input required type="number" min="1" value={formData.units} onChange={e => setFormData({...formData, units: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hospital Name</label>
                <input required type="text" value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="e.g. MMCH, Ward 10" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Location Details</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="e.g. Town Hall Area" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Required Date & Time</label>
                <input required type="text" value={formData.requiredAt} onChange={e => setFormData({...formData, requiredAt: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="e.g. 25 June, 10:00 PM" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <input required type="tel" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-100" placeholder="Mobile number" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl">
                <input type="checkbox" id="isEmergency" checked={formData.isEmergency} onChange={e => setFormData({...formData, isEmergency: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                <label htmlFor="isEmergency" className="text-sm font-bold text-red-600">Mark as Emergency</label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all mt-4 disabled:bg-red-400">
                {isSubmitting ? 'Submitting...' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestView;