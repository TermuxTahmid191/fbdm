
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  MAIN_ADMIN = 'MAIN_ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  address: string;
  mobile: string;
  whatsapp: string;
  email?: string;
  facebookId?: string;
  lastDonationDate: any;
  profilePic?: string;
  isAvailable: boolean;
  isApproved: boolean;
  donationsCount: number;
  // Card & Certificate Admin Approvals
  isCardApproved?: boolean;
  isCertificateApproved?: boolean;
  cardRequestDate?: string;
  certificateRequestDate?: string;
  // Leaderboard Custom Honor / Badges
  customRankTitle?: string;
  isPinnedOnLeaderboard?: boolean;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  location: string;
  requiredAt: string;
  contactNumber: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED';
  isEmergency: boolean;
  createdAt: any;
}

export interface MoneyDonation {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  amount: number;
  paymentMethod: string;
  accountUsed: string;
  transactionId: string;
  date: any;
  note?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'NORMAL' | 'HIGH';
}

export interface DonationEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  contactPerson: string;
  interestedCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'URGENT_BLOOD' | 'REQUEST_STATUS' | 'DONATION' | 'ANNOUNCEMENT';
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  bloodGroup?: BloodGroup;
}

export interface ScheduledDonation {
  id: string;
  userId: string;
  userName: string;
  userBloodGroup: BloodGroup;
  userMobile?: string;
  targetDate: string; // YYYY-MM-DD
  hospitalOrCenter: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  note?: string;
}

export interface AppSettings {
  orgName: string;
  tagline: string;
  emergencyHotline: string;
  officialEmail: string;
  facebookGroupUrl: string;
  facebookPageUrl?: string;
  officeAddress: string;
  // Official Donation Payment Numbers
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  rocketNumber: string;
  rocketType: string;
  bankDetails: string;
  // Dynamic Emergency Contacts
  emergencyContacts: EmergencyContact[];
  // Announcement / Notice Banner
  activeBannerNotice: string;
  showBannerNotice: boolean;
  // App UI Texts & Content
  heroTitle?: string;
  heroSubtitle?: string;
  donationAppealText?: string;
  aboutUsText?: string;
  // Certificate & Membership Card Customizable Signatures & Details
  certSignatoryName1?: string;
  certSignatoryTitle1?: string;
  certSignatoryName2?: string;
  certSignatoryTitle2?: string;
  certFounderName?: string;
  certSealText?: string;
  cardIssuerTitle?: string;
  cardHospitalHotline?: string;
  // Leaderboard Custom Announcements & Settings
  leaderboardTitle?: string;
  leaderboardAnnouncement?: string;
  // Meta
  updatedAt: string;
  updatedBy: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  adminName: string;
  adminRole: UserRole;
  action: 'SETTINGS_UPDATE' | 'USER_EDIT' | 'CARD_APPROVAL' | 'CERTIFICATE_APPROVAL' | 'LEADERBOARD_EDIT' | 'NOTICE_EDIT' | 'EVENT_EDIT' | 'ADMIN_ADDED' | 'SYSTEM_RESET';
  details: string;
  targetId?: string;
  timestamp: string; // ISO string
  expiryTimestamp: string; // Auto-cleaned after 30 days
}
