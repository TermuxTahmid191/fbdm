import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { User, BloodGroup, ScheduledDonation } from '../types';

interface DonationSchedulerProps {
  currentUser: User | null;
  onSaveSchedule: (donation: ScheduledDonation) => void;
  onClose: () => void;
}

const MYMENSINGH_CENTERS = [
  'Mymensingh Medical College Hospital (MMCH) Blood Bank',
  'Bangladesh Red Crescent Society, Mymensingh Unit (Town Hall)',
  'Community Based Medical College Hospital (CBMCH), Churkhai',
  'Upazila Health Complex, Muktagacha',
  'Upazila Health Complex, Trishal',
  'Upazila Health Complex, Bhaluka',
  'Direct Patient Bedside / Hospital in Mymensingh'
];

export const DonationScheduler: React.FC<DonationSchedulerProps> = ({
  currentUser,
  onSaveSchedule,
  onClose
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  // Determine last donation date
  const lastDonationDateObj = useMemo(() => {
    if (!currentUser?.lastDonationDate) return null;
    const d = new Date(currentUser.lastDonationDate);
    return isNaN(d.getTime()) ? null : d;
  }, [currentUser]);

  // Minimum 90 days cooldown for whole blood
  const minEligibleDate = useMemo(() => {
    if (!lastDonationDateObj) return today;
    const eligible = new Date(lastDonationDateObj);
    eligible.setDate(eligible.getDate() + 90);
    return eligible > today ? eligible : today;
  }, [lastDonationDateObj, today]);

  // Default selected date: minEligibleDate or tomorrow
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const defaultDate = new Date(minEligibleDate);
    if (defaultDate <= today) {
      defaultDate.setDate(today.getDate() + 1);
    }
    return defaultDate;
  });

  const [selectedCenter, setSelectedCenter] = useState<string>(MYMENSINGH_CENTERS[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Don't go before current month
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= startOfThisMonth) {
      setCurrentMonth(prev);
    }
  };

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPast = (date: Date) => {
    const cleanToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < cleanToday;
  };

  const isBeforeCooldown = (date: Date) => {
    if (!lastDonationDateObj) return false;
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const cleanEligible = new Date(minEligibleDate.getFullYear(), minEligibleDate.getMonth(), minEligibleDate.getDate());
    return cleanDate < cleanEligible;
  };

  // Days until scheduled
  const daysUntilScheduled = useMemo(() => {
    const diffTime = selectedDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [selectedDate, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const scheduled: ScheduledDonation = {
      id: `sched_${Date.now()}`,
      userId: currentUser?.id || 'guest_user',
      userName: currentUser?.name || 'Dedicated Donor',
      userBloodGroup: (currentUser?.bloodGroup || 'O+') as BloodGroup,
      userMobile: currentUser?.mobile,
      targetDate: formatDateStr(selectedDate),
      hospitalOrCenter: selectedCenter,
      notes: notes.trim() || undefined,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString()
    };

    onSaveSchedule(scheduled);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 to-rose-700 text-white flex-shrink-0 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <CalendarIcon size={24} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles size={11} /> 90-Day Cooldown Tracker
                </span>
                <h2 className="text-xl font-black text-white">Schedule Next Donation</h2>
                <p className="text-xs text-red-100">Set your goal to donate blood and save lives in Mymensingh.</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Donor Cooldown Status Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-black/15 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs">
            <div>
              <p className="text-[11px] text-red-100">Last Blood Donation:</p>
              <p className="font-bold text-white">
                {lastDonationDateObj 
                  ? lastDonationDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'No previous record (Ready now)'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-red-100">Eligibility Status:</p>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-300">
                <CheckCircle2 size={13} />
                {minEligibleDate <= today ? 'Eligible to donate!' : `Eligible from ${minEligibleDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Calendar Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-slate-800 text-sm">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[10px] font-bold text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-9" />;
                }

                const past = isPast(date);
                const cooldown = isBeforeCooldown(date);
                const selected = isSelected(date);
                const isCurrentDay = date.toDateString() === today.toDateString();

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={past}
                    onClick={() => setSelectedDate(date)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                      past
                        ? 'text-slate-300 cursor-not-allowed bg-transparent'
                        : selected
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                        : cooldown
                        ? 'text-amber-700 bg-amber-50/70 hover:bg-amber-100'
                        : 'text-slate-700 bg-white hover:bg-red-50 border border-slate-200/60'
                    }`}
                  >
                    <span>{date.getDate()}</span>
                    {isCurrentDay && !selected && (
                      <span className="w-1 h-1 bg-red-600 rounded-full absolute bottom-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-200 rounded-full inline-block"></span> Cooldown period
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-white border border-slate-300 rounded-full inline-block"></span> Eligible date
              </span>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="p-3.5 bg-red-50/60 border border-red-200/70 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                {selectedDate.getDate()}
              </div>
              <div>
                <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider">Scheduled Target Date</p>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-white text-red-700 rounded-lg border border-red-200 shadow-2xs">
              {daysUntilScheduled <= 0 ? 'Today' : `In ${daysUntilScheduled} days`}
            </span>
          </div>

          {/* Target Center */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-red-500" />
              Target Hospital or Donation Center
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            >
              {MYMENSINGH_CENTERS.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
          </div>

          {/* Notes / Motivation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Heart size={14} className="text-red-500" />
              Personal Note or Pledge (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. For thalassemia emergency, 5th whole blood donation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={16} />
              <span>Confirm & Schedule Donation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationScheduler;
