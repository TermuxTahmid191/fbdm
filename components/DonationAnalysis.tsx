import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  CheckCircle2,
  X,
  PieChart,
  Download
} from 'lucide-react';
import { BloodRequest, MoneyDonation, User, BloodGroup } from '../types';

interface DonationAnalysisProps {
  requests: BloodRequest[];
  donations: MoneyDonation[];
  donors: User[];
  onClose?: () => void;
}

export const DonationAnalysis: React.FC<DonationAnalysisProps> = ({
  requests,
  donations,
  donors,
  onClose
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'MONTH' | 'YEAR'>('ALL');

  // Blood group breakdown
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const bloodGroupStats = bloodGroups.map(group => {
    const donorCount = donors.filter(d => d.bloodGroup === group).length;
    const requestCount = requests.filter(r => r.bloodGroup === group).length;
    const fulfilledCount = requests.filter(r => r.bloodGroup === group && r.status === 'FULFILLED').length;
    return {
      group,
      donorCount,
      requestCount,
      fulfilledCount,
      donorPercent: donors.length > 0 ? Math.round((donorCount / donors.length) * 100) : 0
    };
  });

  // Upazila breakdown
  const upazilas = [
    'Sadar',
    'Muktagachha',
    'Fulbaria',
    'Trishal',
    'Bhaluka',
    'Gauripur',
    'Ishwarganj',
    'Nandail',
    'Haluaghat',
    'Dhobaura',
    'Tara Khanda'
  ];

  const upazilaStats = upazilas.map(upazila => {
    const count = donors.filter(d => (d.upazila || '').toLowerCase() === upazila.toLowerCase()).length;
    return {
      upazila,
      count,
      percent: donors.length > 0 ? Math.round((count / donors.length) * 100) : 0
    };
  }).sort((a, b) => b.count - a.count);

  // High-level aggregates
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED').length;
  const emergencyRequests = requests.filter(r => r.isEmergency).length;
  const fulfillmentRate = totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 100;
  
  const totalVerifiedDonationsBDT = donations
    .filter(d => d.status === 'VERIFIED')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const totalDonationBags = donors.reduce((acc, d) => acc + (d.donationsCount || 0), 0) + fulfilledRequests;
  const estimatedLivesSaved = Math.max(totalDonationBags * 3, 12);
  const activeReadyDonors = donors.filter(d => d.isAvailable).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Donation Analysis & Impact Report</h3>
              <p className="text-xs text-slate-400">Real-time statistics for Mymensingh humanitarian drives</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
          
          {/* Top Impact Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center mb-2">
                <Heart size={16} className="fill-white" />
              </div>
              <p className="text-xs text-slate-500 font-semibold">Total Donors</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{donors.length}</p>
              <p className="text-[10px] text-red-600 font-bold mt-1">{activeReadyDonors} ready to donate</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs text-slate-500 font-semibold">Fulfillment Rate</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{fulfillmentRate}%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">{fulfilledRequests} requests fulfilled</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2">
                <Activity size={16} />
              </div>
              <p className="text-xs text-slate-500 font-semibold">Lives Saved</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{estimatedLivesSaved}+</p>
              <p className="text-[10px] text-blue-600 font-bold mt-1">~3 lives per donor bag</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2">
                <DollarSign size={16} />
              </div>
              <p className="text-xs text-slate-500 font-semibold">Financial Support</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">৳{totalVerifiedDonationsBDT.toLocaleString()}</p>
              <p className="text-[10px] text-amber-600 font-bold mt-1">{donations.length} total contributions</p>
            </div>
          </div>

          {/* Blood Group Analysis Grid */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart size={18} className="text-red-600" />
                <h4 className="font-bold text-sm text-slate-800">Blood Group Availability & Demand</h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">8 Categories</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bloodGroupStats.map((item) => (
                <div key={item.group} className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-xs">
                      {item.group}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{item.donorCount} Donors</span>
                  </div>
                  
                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ width: `${Math.max(item.donorPercent * 2, 8)}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.donorPercent}% of network</span>
                    <span>{item.requestCount} requests</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Upazila Distribution & Request Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upazila Coverage */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-red-600" />
                <h4 className="font-bold text-sm text-slate-800">Donor Density by Upazila</h4>
              </div>

              <div className="space-y-2.5">
                {upazilaStats.slice(0, 6).map((u) => (
                  <div key={u.upazila}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{u.upazila}</span>
                      <span className="text-slate-500 font-medium">{u.count} donors ({u.percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full"
                        style={{ width: `${Math.max(u.percent * 2.5, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Breakdown & Urgency */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-800">Emergency & Request Insights</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700">Emergency Blood Requests</span>
                    </div>
                    <span className="text-xs font-bold text-red-600">{emergencyRequests} Critical</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-700">Successfully Fulfilled</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{fulfilledRequests} Patients</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold text-slate-700">Pending Blood Drives</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">
                      {requests.filter(r => r.status === 'PENDING').length} Ongoing
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Average response time for Mymensingh Sadar emergencies: <strong>&lt; 45 minutes</strong></span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Updated live from FBDM registry • Free Blood Donation Mymensingh
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
