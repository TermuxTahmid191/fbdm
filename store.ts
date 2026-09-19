
import { Notice, DonationEvent, User, BloodRequest, MoneyDonation, UserRole } from './types';

export const adminUser: User = {
  id: 'admin_fbdm',
  name: 'Main Admin',
  role: UserRole.MAIN_ADMIN,
  bloodGroup: 'O+',
  division: 'Mymensingh',
  district: 'Mymensingh',
  upazila: 'Sadar',
  address: 'Town Hall Area, Mymensingh',
  mobile: '01700000000',
  whatsapp: '01700000000',
  email: 'admin@fbdm.com',
  lastDonationDate: '2024-01-15',
  isAvailable: true,
  isApproved: true,
  donationsCount: 12
};

export const initialNotices: Notice[] = [
  { id: 'n1', title: 'World Blood Donor Day', content: 'Join us for a massive drive next Sunday at Medical College.', date: '2024-06-14', priority: 'HIGH' },
  { id: 'n2', title: 'New App Launched!', content: 'Welcome to the FBDM official application. Stay connected.', date: '2024-05-20', priority: 'NORMAL' }
];

export const initialEvents: DonationEvent[] = [
  { id: 'e1', title: 'Medical College Drive', date: '2024-06-20 10:00 AM', location: 'Mymensingh Medical College', contactPerson: 'Arif Ahmed', interestedCount: 45 }
];

export const initialDonors: User[] = [
  adminUser,
  {
    id: 'd1',
    name: 'Kabir Khan',
    role: UserRole.USER,
    bloodGroup: 'B+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Sadar',
    address: 'Patgudam, Mymensingh',
    mobile: '01711223344',
    whatsapp: '01711223344',
    email: 'kabir@example.com',
    lastDonationDate: '2024-01-01',
    isAvailable: true,
    isApproved: true,
    donationsCount: 8
  },
  {
    id: 'd2',
    name: 'Zarin Tasnim',
    role: UserRole.USER,
    bloodGroup: 'O+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Trishal',
    address: 'University Gate, Trishal',
    mobile: '01511223344',
    whatsapp: '01511223344',
    email: 'zarin@example.com',
    lastDonationDate: '2024-04-15',
    isAvailable: false,
    isApproved: true,
    donationsCount: 2
  },
  {
    id: 'd3',
    name: 'Mahbub Alam',
    role: UserRole.USER,
    bloodGroup: 'A+',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Muktagacha',
    address: 'Rajbari Road, Muktagacha',
    mobile: '01811223344',
    whatsapp: '01811223344',
    email: 'mahbub@example.com',
    lastDonationDate: '2023-11-20',
    isAvailable: true,
    isApproved: true,
    donationsCount: 5
  }
];

export const initialRequests: BloodRequest[] = [
  {
    id: 'r1',
    patientName: 'Sufia Begum',
    bloodGroup: 'B+',
    units: 2,
    hospitalName: 'MMCH (Mymensingh Medical College)',
    location: 'Ward 5, 2nd Floor',
    requiredAt: 'Today 08:00 PM',
    contactNumber: '01811111111',
    requestedBy: 'admin_fbdm',
    status: 'APPROVED',
    isEmergency: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'r2',
    patientName: 'Kamil Hossain',
    bloodGroup: 'A-',
    units: 1,
    hospitalName: 'Christian Mission Hospital',
    location: 'Cabin 202',
    requiredAt: 'Tomorrow 10:00 AM',
    contactNumber: '01922222222',
    requestedBy: 'd1',
    status: 'PENDING',
    isEmergency: false,
    createdAt: new Date().toISOString()
  }
];

export const initialDonations: MoneyDonation[] = [
  {
    id: 'm1',
    userId: 'admin_fbdm',
    userName: 'Main Admin',
    userMobile: '01700000000',
    amount: 1000,
    paymentMethod: 'bKash',
    accountUsed: '01700000000',
    transactionId: 'TXN987654321',
    date: { toDate: () => new Date('2024-05-20') },
    note: 'Community fund support',
    status: 'VERIFIED'
  },
  {
    id: 'm2',
    userId: 'd1',
    userName: 'Kabir Khan',
    userMobile: '01711223344',
    amount: 500,
    paymentMethod: 'Nagad',
    accountUsed: '01711223344',
    transactionId: 'NGD54321987',
    date: { toDate: () => new Date('2024-06-01') },
    note: 'Monthly donation',
    status: 'PENDING'
  }
];

