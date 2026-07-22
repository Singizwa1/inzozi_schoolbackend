import { Response, Request,NextFunction } from "express";


export interface CreateSchoolManagerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female' | 'Other';
  province?: string;
  district: string;
  schoolId?: string;
}

export interface CreateAdmissionManagerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female' | 'Other';
  district: string;
  schoolId: string;
  province?:string
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  roleId: string;
  schoolId?: string;
  district: string;
}


export interface LoginUserRequest extends Request{
    body: {
        email: string,
        password:string
    }
}
export interface UserControllerImplementation {
    getAllUsers(req: Request, res: Response): void
    login(req:LoginUserRequest,res:Response):void
}
