// src/interfaces/student.ts
export interface ICreateStudent {
  schoolId: string; 
  firstName: string;
  middleName?: string;
  lastName: string;
    level: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
    yearOfStudy:string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  DOB: string;
  studentType: 'newcomer' | 'transfer';
  passportPhoto: string;
  fathersNames: string;
  mothersNames: string;
  representerEmail: string;
  representerPhone: string;
  nationality: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  resultSlip?: string;
  previousReport?: string;
  mitationLetter?: string;
}

export interface IStudentSearch {
  level?: string;
  studentType?: string;
  yearOfStudy?: string;
  schoolId?: string;
}

export interface ICreateApplication {
  studentId: string;
  status?: 'pending' | 'approved' | 'rejected';
}
