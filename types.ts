
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