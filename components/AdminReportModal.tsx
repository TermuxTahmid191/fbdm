import React, { useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Droplet, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { BloodRequest, MoneyDonation, User } from '../types';

interface AdminReportModalProps {
  requests: BloodRequest[];
  donations: MoneyDonation[];
  users: User[];
  onClose: () => void;
}

export const AdminReportModal: React.FC<AdminReportModalProps> = ({
  requests,
  donations,
  users,
  onClose
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const reportTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const reportId = `FBDM-REP-${Date.now().toString().slice(-6)}`;

  // Summary Metrics
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED').length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const approvedRequests = requests.filter(r => r.status === 'APPROVED').length;
  const emergencyRequests = requests.filter(r => r.isEmergency).length;

  const totalVerifiedFunds = donations
    .filter(d => d.status === 'VERIFIED')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const totalPendingFunds = donations
    .filter(d => d.status === 'PENDING')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Trigger Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push("--- BLOOD REQUESTS SUMMARY ---");
    csvRows.push("ID,Patient Name,Blood Group,Units,Hospital,Location,Urgency,Status,Required At");
    requests.forEach(r => {
      csvRows.push(`"${r.id}","${r.patientName}","${r.bloodGroup}",${r.units},"${r.hospitalName}","${r.location}","${r.isEmergency ? 'EMERGENCY' : 'NORMAL'}","${r.status}","${r.requiredAt}"`);
    });

    csvRows.push("\n--- FINANCIAL DONATIONS SUMMARY ---");
    csvRows.push("ID,Donor Name,Mobile,Amount,Method,Account,TrxID,Status,Date");
    donations.forEach(d => {
      csvRows.push(`"${d.id}","${d.userName}","${d.userMobile}",${d.amount},"${d.paymentMethod}","${d.accountUsed}","${d.transactionId}","${d.status}","${d.date}"`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FBDM_Report_${reportId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Official FBDM Activity & Audit Report</h3>
              <p className="text-[11px] text-slate-400">Ready for PDF generation and administrative records.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div 
          ref={printAreaRef}
          id="fbdm-admin-print-report"
          className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1 bg-white text-slate-900 font-sans"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-red-600 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Droplet size={32} className="fill-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Free Blood Donation Mymensingh (FBDM)
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Charpara, Mymensingh-2200, Bangladesh • Reg. Community Voluntary Organization
                </p>
                <p className="text-[11px] text-red-600 font-semibold">
                  Official Blood Donation & Financial Audit Report
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 border-l sm:border-l-0 sm:border-r-0 pl-3 sm:pl-0">
              <p className="font-mono text-slate-700 font-bold">Ref: {reportId}</p>
              <p className="mt-0.5">Date: {reportDate}</p>
              <p>Time: {reportTime}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                AUTHENTICATED
              </span>
            </div>
          </div>

          {/* Executive Summary Stats */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Executive Activity Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Registered Donors</p>
                <p className="text-xl font-black text-slate-800">{users.length}</p>
                <p className="text-[10px] text-slate-500">Mymensingh network</p>
              </div>
              <div className="p-3 bg-red-50/70 rounded-xl border border-red-200">
                <p className="text-[10px] uppercase font-bold text-red-600">Total Blood Requests</p>
                <p className="text-xl font-black text-red-700">{totalRequests}</p>
                <p className="text-[10px] text-red-600/80">{emergencyRequests} Emergencies</p>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Fulfilled Requests</p>
                <p className="text-xl font-black text-emerald-700">{fulfilledRequests}</p>
                <p className="text-[10px] text-emerald-600">
                  {totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0}% Success rate
                </p>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <p className="text-[10px] uppercase font-bold text-blue-700">Financial Support</p>
                <p className="text-xl font-black text-blue-800">৳{totalVerifiedFunds.toLocaleString()}</p>
                <p className="text-[10px] text-blue-600">Verified donations</p>
              </div>
            </div>
          </div>

          {/* Blood Requests Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet size={14} className="text-red-600" />
                <span>Patient Blood Requests Log ({requests.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Pending: {pendingRequests} | Approved: {approvedRequests} | Fulfilled: {fulfilledRequests}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border-b border-slate-200">Patient</th>
                    <th className="p-2.5 border-b border-slate-200">Group</th>
                    <th className="p-2.5 border-b border-slate-200">Units</th>
                    <th className="p-2.5 border-b border-slate-200">Hospital / Area</th>
                    <th className="p-2.5 border-b border-slate-200">Date Needed</th>
                    <th className="p-2.5 border-b border-slate-200">Priority</th>
                    <th className="p-2.5 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">No requests recorded.</td>
                    </tr>
                  ) : (
                    requests.slice(0, 15).map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-bold text-slate-800">{req.patientName}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-black rounded text-[10px]">
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium">{req.units} bag{req.units > 1 ? 's' : ''}</td>
                        <td className="p-2.5 text-slate-600">{req.hospitalName}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{req.requiredAt}</td>
                        <td className="p-2.5">
                          {req.isEmergency ? (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white rounded font-bold text-[9px]">
                              URGENT
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            req.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {requests.length > 15 && (
                <div className="p-2 bg-slate-50 text-center text-[11px] text-slate-500 border-t border-slate-200">
                  Showing top 15 of {requests.length} blood request records.
                </div>
              )}
            </div>
          </div>

          {/* Financial Donations Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-600" />
                <span>Financial Contributions & Patronage Log</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified: ৳{totalVerifiedFunds.toLocaleString()} | Pending: ৳{totalPendingFunds.toLocaleString()}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border-b border-slate-200">Donor Name</th>
                    <th className="p-2.5 border-b border-slate-200">Contact</th>
                    <th className="p-2.5 border-b border-slate-200">Amount</th>
                    <th className="p-2.5 border-b border-slate-200">Method</th>
                    <th className="p-2.5 border-b border-slate-200">TrxID</th>
                    <th className="p-2.5 border-b border-slate-200">Date</th>
                    <th className="p-2.5 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">No financial donations recorded.</td>
                    </tr>
                  ) : (
                    donations.slice(0, 10).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-bold text-slate-800">{d.userName}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{d.userMobile}</td>
                        <td className="p-2.5 font-black text-slate-900">৳{d.amount.toLocaleString()}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{d.paymentMethod}</td>
                        <td className="p-2.5 font-mono text-slate-500 text-[10px]">{d.transactionId}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{d.date}</td>
                        <td className="p-2.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            d.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures and Verification Footer */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-300 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Administrative Officer</p>
              <p className="text-[10px] text-slate-400">FBDM Central Secretariat</p>
            </div>
            <div>
              <div className="border-b border-slate-300 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Convener / President</p>
              <p className="text-[10px] text-slate-400">Free Blood Donation Mymensingh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportModal;
