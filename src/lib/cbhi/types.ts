import type {
  Gender,
  MembershipStatus,
  PaymentPrefix,
  Profession,
  Relationship,
  RuralTown,
  SlidingScale,
} from "./constants";

export type { Gender, MembershipStatus, PaymentPrefix, Profession, Relationship, RuralTown, SlidingScale };

export interface GeoSettings {
  region: string;
  zone: string;
  woreda: string;
  regionCode: string;
  zoneCode: string;
  woredaCode: string;
}

export interface ClusterRow {
  id: string;
  name: string;
  sort: number;
}

export interface PhcuRow {
  id: string;
  clusterId: string;
  name: string;
  sort: number;
}

export interface KebeleRow {
  id: string;
  phcuId: string;
  name: string;
  code: string;
  ruralTown: RuralTown;
  sort: number;
}

export interface HouseholdRow {
  id: string;
  householdCode: string;
  paymentPrefix: PaymentPrefix;
  kebeleId: string;
  gote: string;
  slidingScale: SlidingScale;
  ruralTown: RuralTown;
  hasIdCard: boolean;
  fan: string;
  membershipStatus: MembershipStatus;
  enrollmentDay: number | null;
  enrollmentMonth: number | null;
  enrollmentYear: number | null;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface MemberRow {
  id: string;
  householdId: string;
  beneficiaryCode: string;
  fullName: string;
  searchName: string;
  dobDay: number | null;
  dobMonth: number | null;
  dobYear: number | null;
  gender: Gender;
  relationship: Relationship;
  profession: Profession;
  photoId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface PhotoRow {
  id: string;
  memberId: string;
  blob: Blob;
  mime: string;
  createdAt: number;
}

export interface MetaRow {
  key: string;
  value: string;
}

export interface HouseholdView extends HouseholdRow {
  kebeleName: string;
  kebeleCode: string;
  phcuName: string;
  clusterName: string;
  headName: string;
  memberCount: number;
  premium: number;
}

export interface MemberView extends MemberRow {
  householdCode: string;
  kebeleName: string;
  photoUrl?: string;
}

export interface DashboardStats {
  households: number;
  members: number;
  photos: number;
  renewed: number;
  unrenewed: number;
  byScale: Record<SlidingScale, { households: number; members: number; premium: number }>;
  byRural: Record<RuralTown, number>;
  byKebele: { name: string; code: string; households: number; members: number }[];
  byGender: Record<Gender, number>;
  byProfession: { name: string; count: number }[];
  paying: number;
  indigent: number;
}
