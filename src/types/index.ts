// User types
export type UserRole = 'superadmin' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

// Giftcard types
export type GiftcardStatus = 'created_not_delivered' | 'delivered' | 'redeemed' | 'cancelled';

export interface Giftcard {
  id: string;
  number: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  recipient: {
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  status: GiftcardStatus;
  createdAt: string;
  duration?: number; // Duración en días (por defecto 90)
  deliveredAt?: string;
  expiresAt?: string;
  redeemedAt?: string;
  cancelledAt?: string;
  notes?: string;
  artist?: string;
  termsAcceptedAt?: string;
}

// Activity log
export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  targetType: 'giftcard' | 'user' | 'system' | 'terms';
  targetId?: string;
  details?: string;
  timestamp: string;
}

// Terms and conditions
export interface TermsAndConditions {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

// Site settings
export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  logoColor: string;
  terms?: TermsAndConditions;
  contactInfo?: ContactInfo;
  testimonials?: Testimonial[];
  socialLinks?: SocialLink[];
}

// Search & filter
export interface GiftcardSearchFilters {
  number?: string;
  code?: string;
  email?: string;
  phone?: string;
  status?: GiftcardStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PublicGiftcardView {
  number: string;
  amount: number;
  status: GiftcardStatus;
  deliveredAt?: string;
  expiresAt?: string;
  termsAcceptedAt?: string;
}