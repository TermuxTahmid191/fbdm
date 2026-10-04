import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Droplet,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface FAQItem {
  id: string;
  questionEn: string;
  questionBn: string;
  answerEn: string;
  answerBn: string;
  category: 'ELIGIBILITY' | 'SAFETY' | 'CENTERS' | 'PREPARATION' | 'EMERGENCY';
  tag?: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'ELIGIBILITY',
    questionEn: 'Who is eligible to donate blood in Mymensingh?',
    questionBn: 'কারা রক্তদান করতে পারবেন? (রক্তদানের যোগ্যতা)',
    answerEn: 'Any healthy individual aged between 18 and 60 years, weighing at least 45 kg (ideally 48kg+ for men), with normal blood pressure (Systolic 100-140, Diastolic 60-90 mmHg) and hemoglobin level above 12.5 g/dL can donate whole blood safely.',
    answerBn: '১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ ব্যক্তি, যার শরীরের ওজন ন্যূনতম ৪৫ কেজি (পুরুষদের ক্ষেত্রে ৪৮ কেজি+ বাঞ্ছনীয়), রক্তচাপ ও নাড়ির গতি স্বাভাবিক এবং হিমোগ্লোবিনের মাত্রা ১২.৫ গ্রাম/ডেসিলিটার বা তার বেশি, তিনি সম্পূর্ণ নিরাপদে রক্তদান করতে পারবেন।',
    tag: 'Requirements'
  },
  {
    id: 'faq-2',
    category: 'ELIGIBILITY',
    questionEn: 'How frequently can I donate blood?',
    questionBn: 'কত দিন পরপর একজন মানুষ রক্তদান করতে পারেন?',
    answerEn: 'Male donors can donate whole blood every 90 days (3 months), and female donors can donate every 120 days (4 months). Your blood plasma regenerates within 24–48 hours, and red blood cells fully replenish within 4–6 weeks.',
    answerBn: 'পুরুষরা প্রতি ৩ মাস (৯০ দিন) পরপর এবং নারীরা প্রতি ৪ মাস (১২০ দিন) পরপর রক্তদান করতে পারেন। রক্তদানের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে রক্তের জলীয় অংশ (প্লাজমা) পূরণ হয়ে যায় এবং ৪ থেকে ৬ সপ্তাহের মধ্যে লোহিত রক্তকণিকা পুরোপুরি তৈরি হয়ে যায়।',
    tag: 'Interval'
  },
  {
    id: 'faq-3',
    category: 'SAFETY',
    questionEn: 'Is blood donation painful or risky? Can I catch any disease?',
    questionBn: 'রক্তদানে কি কোনো ব্যথা বা রোগের ঝুঁকি থাকে?',
    answerEn: 'Not at all! Donating blood is 100% safe. Trained healthcare professionals at MMCH and certified blood banks always use brand-new, sterile, disposable needle kits and blood bags opened right in front of you and disposed of immediately after. There is zero risk of contracting HIV, Hepatitis B/C, or any other blood-borne virus.',
    answerBn: 'একদমই না! রক্তদান সম্পূর্ণ নিরাপদ ও পার্শ্বপ্রতিক্রিয়ামুক্ত। ময়মনসিংহ মেডিকেল ও যেকোনো স্বীকৃত ব্লাড ব্যাংকে সবসময় জীবাণুমুক্ত নতুন ওয়ান-টাইম নিডল ও ব্যাগ ব্যবহার করা হয় যা আপনার সামনেই খোলা হবে। তাই হেপাটাইটিস, এইচআইভি বা অন্য কোনো রোগে আক্রান্ত হওয়ার ১% সম্ভাবনাও নেই। সুঁই ফোটানোর সময় সামান্য পিঁপড়ার কামড়ের মতো অনুভূতি ছাড়া কোনো তীব্র ব্যথা হয় না।',
    tag: 'Safety First'
  },
  {
    id: 'faq-4',
    category: 'CENTERS',
    questionEn: 'Where can I donate blood in Mymensingh?',
    questionBn: 'ময়মনসিংহ শহরে কোথায় কোথায় রক্তদান করা যায়?',
    answerEn: 'Major verified blood donation centers in Mymensingh include: 1) Mymensingh Medical College Hospital (MMCH) Blood Transfusion Dept (Charpara, open 24/7); 2) Bangladesh Red Crescent Society Mymensingh Unit (Town Hall area); 3) Community Based Medical College Hospital (CBMCH), Churkhai; and 4) FBDM community camps organized across upazilas.',
    answerBn: 'ময়মনসিংহের প্রধান রক্তদান কেন্দ্রসমূহ হলো: ১) ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল (মমেকহ) ট্রান্সফিউশন মেডিসিন বিভাগ (চরপাড়া, ২৪ ঘণ্টা খোলা); ২) বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি ময়মনসিংহ ইউনিট (টাউন হল সংলগ্ন); ৩) কমিউনিটি বেজড মেডিকেল কলেজ হাসপাতাল (সিবিএমসিএইচ), চুরখাই; এবং ৪) FBDM এর নিয়মিত ভ্রাম্যমাণ রক্তদান ক্যাম্প।',
    tag: 'Local Spot'
  },
  {
    id: 'faq-5',
    category: 'PREPARATION',
    questionEn: 'What should I do before and after giving blood?',
    questionBn: 'রক্তদানের পূর্বে এবং পরে কী কী নিয়ম মেনে চলা উচিত?',
    answerEn: 'Before: Drink 500ml extra water, eat a healthy meal 2-3 hours before (avoid greasy fast food), and get 6-8 hours of sound sleep. After: Rest for 10-15 minutes, drink fruit juice or oral saline, avoid heavy lifting or intense workouts for 24 hours, and keep the bandage on for at least 4 hours.',
    answerBn: 'রক্তদানের পূর্বে: পর্যাপ্ত পানি (অন্তত ৫০০ মিলি) পান করুন, ২-৩ ঘণ্টা আগে পুষ্টিকর খাবার খেয়ে নিন (তৈলাক্ত ফাস্টফুড পরিহার করুন), এবং আগের রাতে ভালো ঘুম হওয়া জরুরি। রক্তদানের পর: ১০-১৫ মিনিট শুয়ে বিশ্রাম নিন, ফলের জুস বা স্যালাইন খান, ভারী ব্যায়াম বা ভারোত্তোলন ওইদিন বন্ধ রাখুন এবং ব্যান্ডেজ অন্তত ৪ ঘণ্টা লাগিয়ে রাখুন।',
    tag: 'Care Guide'
  },
  {
    id: 'faq-6',
    category: 'SAFETY',
    questionEn: 'Are there health benefits to donating blood regularly?',
    questionBn: 'নিয়মিত রক্তদানের শারীরিক উপকারিতা কী কী?',
    answerEn: 'Yes! Regular blood donors have a significantly reduced risk of heart attacks and strokes, balanced iron levels, stimulated bone marrow production of fresh new blood cells, and receive a free vital health screening (BP, pulse, hemoglobin, and infectious disease screening like Hepatitis and HIV).',
    answerBn: 'হ্যাঁ! নিয়মিত রক্তদান করলে হৃদরোগ ও স্ট্রোকের ঝুঁকি বহুগুণে হ্রাস পায়, শরীরে আয়রনের ক্ষতিকর ভারসাম্য বজায় থাকে, নতুন রক্তকণিকা তৈরিতে অস্থিমজ্জা সক্রিয় হয় এবং রক্তদানের পূর্বে বিনামূল্যে হেপাটাইটিস বি/সি, এইডস ও সিফিলিস স্ক্রিনিং সম্পন্ন হয়।',
    tag: 'Benefits'
  },
  {
    id: 'faq-7',
    category: 'EMERGENCY',
    questionEn: 'How does FBDM manage emergency blood requests in Mymensingh?',
    questionBn: 'ময়মনসিংহে জরুরি রক্তের প্রয়োজনে FBDM কীভাবে কাজ করে?',
    answerEn: 'FBDM connects patients in Mymensingh hospitals directly with verified local donors across Sadar, Trishal, Muktagacha, Bhaluka, and other upazilas. When an emergency request is posted, verified available donors of matching blood groups receive instant alerts and can be contacted via phone or WhatsApp immediately.',
    answerBn: 'ময়মনসিংহের সদর, ত্রিশাল, মুক্তাগাছা, ভালুকা, ফুলপুরসহ সকল উপজেলার যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের সাথে FBDM প্ল্যাটফর্ম সরাসরি রোগীদের যুক্ত করে। কোনো রোগী রক্তের রিকোয়েস্ট পাঠালে সঙ্গে সঙ্গে উক্ত ব্লাড গ্রুপের নিকটস্থ ডোনারদের কাছে নোটিফিকেশন পৌঁছে যায়।',
    tag: 'FBDM Network'
  },
  {
    id: 'faq-8',
    category: 'ELIGIBILITY',
    questionEn: 'Can women donate blood during periods or pregnancy?',
    questionBn: 'নারীরা কি পিরিয়ড বা গর্ভাবস্থায় রক্তদান করতে পারবেন?',
    answerEn: 'Women can donate during normal menstruation if they feel physically well and their hemoglobin is 12.5 g/dL or above. However, pregnant women, breastfeeding mothers (up to 6-12 months postpartum), or those recovering from major surgery must temporarily defer blood donation.',
    answerBn: 'মাসিক বা পিরিয়ডের সময় যদি কোনো অতিরিক্ত রক্তক্ষরণ না হয় এবং হিমোগ্লোবিন ঠিক থাকে (১২.৫ গ্রাম/ডেসিলিটার+), তবে রক্তদান করতে কোনো বাধা নেই। তবে গর্ভাবস্থায় এবং সন্তানকে বুকের দুধ খাওয়ানোর সময় (সন্তানের বয়স ৬ মাস হওয়া পর্যন্ত) রক্তদান করা সম্পূর্ণ নিষিদ্ধ।',
    tag: 'Special Guide'
  }
];

interface FAQViewProps {
  onNavigate: (tab: string) => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const categories = [
    { id: 'ALL', label: 'All Questions (সকল প্রশ্ন)' },
    { id: 'ELIGIBILITY', label: 'Eligibility (যোগ্যতা)' },
    { id: 'SAFETY', label: 'Safety & Health (নিরাপত্তা)' },
    { id: 'CENTERS', label: 'Mymensingh Centers (কেন্দ্রসমূহ)' },
    { id: 'PREPARATION', label: 'Do\'s & Don\'ts (করণীয়)' },
    { id: 'EMERGENCY', label: 'Emergency Help (জরুরি সহায়তা)' },
  ];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      faq.questionEn.toLowerCase().includes(q) ||
      faq.questionBn.toLowerCase().includes(q) ||
      faq.answerEn.toLowerCase().includes(q) ||
      faq.answerBn.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md border border-white/20">
            <HelpCircle size={14} className="text-red-200" />
            Mymensingh Blood Donor Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-red-100 text-sm sm:text-base leading-relaxed opacity-95">
            Everything you need to know about whole blood donation, safety facts, eligibility criteria, and donation centers across Mymensingh.
          </p>
        </div>

        {/* Decorative Blood Drop */}
        <Droplet className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
      </section>

      {/* Search & Categories */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search any question (e.g. eligibility, MMCH center, weight, safety)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-xs transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <section className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <HelpCircle size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No questions found matching your query.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with other words like "weight", "MMCH", or "interval".</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded 
                    ? 'border-red-300 shadow-md ring-1 ring-red-100' 
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 select-none focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isExpanded ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
                    }`}>
                      <Droplet size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {faq.tag && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {faq.tag}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {faq.questionBn}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {faq.questionEn}
                      </p>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                    isExpanded ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-slate-700 border-t border-slate-100 bg-slate-50/40 space-y-3 animate-in fade-in duration-200">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 size={13} /> বাংলা উত্তর
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed font-normal">
                        {faq.answerBn}
                      </p>
                    </div>

                    <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/60">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        English Answer
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {faq.answerEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Mymensingh Major Blood Center Hotlines */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Key Blood Banks in Mymensingh</h3>
            <p className="text-xs text-slate-500">Official hospital contact numbers for immediate blood arrangements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-800">MMCH Blood Bank (মমেকহ)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Charpara, Mymensingh (24/7 Available)</p>
              <span className="inline-block mt-2 font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                Hotline: 091-66666
              </span>
            </div>
            <a 
              href="tel:09166666" 
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors"
              title="Call MMCH Blood Bank"
            >
              <Phone size={16} />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Red Crescent Mymensingh</h4>
              <p className="text-xs text-slate-500 mt-0.5">Town Hall Road, Mymensingh</p>
              <span className="inline-block mt-2 font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                Hotline: 01711-000000
              </span>
            </div>
            <a 
              href="tel:01711000000" 
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors"
              title="Call Red Crescent"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action: Donate / Request */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-lg text-white">Ready to save a life today?</h4>
          <p className="text-xs text-slate-300 mt-0.5">Join thousands of verified donors across Mymensingh.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('search')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            Find a Donor
          </button>
          <button
            onClick={() => onNavigate('request')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition-all"
          >
            Request Blood
          </button>
        </div>
      </section>
    </div>
  );
};

export default FAQView;
