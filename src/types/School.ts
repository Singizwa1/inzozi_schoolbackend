// interfaces/ISchool.ts
export interface ISchoolRegister {
  schoolName: string;
  schoolCode: string;
  email: string;
  district: string;
  licenseDocument: string; 
  province?: string;
  sector?: string;
  cell?: string;
  village?: string;
  schoolCategory?: 'REB' | 'RTB';
  schoolLevel?: 'Nursery' | 'Primary' | 'O-Level' | 'A-Level';
  schoolType?: 'Girls' | 'Boys' | 'Mixed';
}

export interface IRejectSchool {
  reason: string;
}

export interface SchoolProfileDto {
  schoolId: number;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
}
export interface IUpdateSchoolProfile {
  description?: string;
  mission?: string;
  vision?: string;
  foundedYear?: number;
  //accreditation?: string;
  //languagesOffered?: string[];
  //extracurriculars?: string[];
  profilePhoto?: string | null;
}

export interface ICreateSchoolSpot {
  level: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
  studentType: 'newcomer' | 'transfer';
  academicYear: string;
  yearofstudy:string;
  totalSpots: number;
  occupiedSpots?: number;
  registrationOpen?: boolean;
  waitingListCount?: number;
  combination?: string[];
  admissionConditions?: {
    minGrade?: string;
    requiredSubjects?: string[];
    examScore?: string;
    interviewRequired?: boolean;
    documents?: string[];
    notes?: string;
  };
}
export interface IUpdateSchoolSpot extends Partial<ICreateSchoolSpot> {}

// Gallery
export interface ICreateSchoolGallery {
  imageUrl: string;
  category:
    | 'classroom'
    | 'computerLab'
    | 'library'
    | 'sports'
    | 'dining'
    | 'dormitory'
    | 'administration'
    | 'playground';
  caption?: string;
  isFeatured?: boolean;
  order?: number;
}

export interface SearchFilters {
  district?: string | undefined;
  schoolType?: string | undefined;
  schoolLevel?: string | undefined;
  schoolCategory?: string | undefined;
  yearOfStudy?: string | undefined;
  combination?: string | undefined; 
  academicYear?: string | undefined;
  minAvailableSpots?: number | undefined; 
}
