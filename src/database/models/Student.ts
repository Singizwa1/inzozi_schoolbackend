// src/database/models/Student.ts
import { Sequelize, Model, DataTypes, Optional } from 'sequelize';

export interface StudentAttributes {
  id: string;
  trackingCode: string;
  schoolId: string;
  schoolSpotId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  yearOfStudy:string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
   level: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
  DOB: string;
  indexNumber?: string;
  studentType: 'newcomer' | 'transfer';
  resultSlip?: string;         
  previousReport?: string;     
  mitationLetter?: string;     
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
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  babyeyiDocument?: string;
  babyeyiIssuedAt?: Date;
  rejectedReason?: string | null;
}

type StudentCreationAttributes = Optional<
  StudentAttributes,
  | 'id'
  | 'middleName'
  | 'indexNumber'
  | 'resultSlip'
  | 'previousReport'
  | 'mitationLetter'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'babyeyiDocument'
  | 'babyeyiIssuedAt'
  |'rejectedReason'
>;

export class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: string;
  public trackingCode!: string;
  public schoolId!: string;
  public schoolSpotId!: string;
  public firstName!: string;
  public middleName?: string;
  public lastName!: string;
  public gender!: 'MALE' | 'FEMALE' | 'OTHER';
  public DOB!: string;
  public yearOfStudy!: string;
  public indexNumber?: string;
  public studentType!: 'newcomer' | 'transfer';
  public  level!: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
  public resultSlip?: string;
  public previousReport?: string;
  public mitationLetter?: string;
  public passportPhoto!: string;
  public fathersNames!: string;
  public mothersNames!: string;
  public representerEmail!: string;
  public representerPhone!: string;
  public nationality!: string;
  public province!: string;
  public district!: string;
  public sector!: string;
  public cell!: string;
  public village!: string;
  public status?: 'pending' | 'approved' | 'rejected';
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt?: Date | null;
  public babyeyiDocument?: string;
  public rejectedReason?: string | null;
  public babyeyiIssuedAt?: Date;

  static associate(models: any) {
    if (models.School) {
      Student.belongsTo(models.School, {
        foreignKey: 'schoolId',
        as: 'school',
      });
    }
    if (models.SchoolSpot) {
      Student.belongsTo(models.SchoolSpot, {
        foreignKey: 'schoolSpotId',
        as: 'spot',
      });
    }
  }
}
// Export a function to initialize the model
export const StudentModel = (sequelize: Sequelize) => {
  Student.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      trackingCode: { type: DataTypes.STRING(8), allowNull: false, unique: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      middleName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: false },
       level: {type:DataTypes.ENUM('Nursery' , 'Primary' ,'O-level' , 'A-level'),allowNull:true},
      gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: false },
      DOB: { type: DataTypes.DATEONLY, allowNull: false },
      indexNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
      studentType: { type: DataTypes.ENUM('newcomer', 'transfer'), allowNull: false },
      yearOfStudy:{ type: DataTypes.STRING, allowNull: true }, 
      resultSlip: { type: DataTypes.STRING, allowNull: true },        
      previousReport: { type: DataTypes.STRING, allowNull: true },    
      mitationLetter: { type: DataTypes.STRING, allowNull: true },    
      passportPhoto: { type: DataTypes.STRING, allowNull: false },
      fathersNames: { type: DataTypes.STRING, allowNull: false },
      mothersNames: { type: DataTypes.STRING, allowNull: false },
      representerEmail: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
      representerPhone: { type: DataTypes.STRING, allowNull: false, validate: { len: [10, 15] } },
      nationality: { type: DataTypes.STRING, allowNull: false },
      rejectedReason: { type: DataTypes.STRING, allowNull: true },
      province: { type: DataTypes.STRING, allowNull: false },
      district: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      cell: { type: DataTypes.STRING, allowNull: false },
      village: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      babyeyiDocument: { type: DataTypes.STRING, allowNull: true },
      babyeyiIssuedAt: { type: DataTypes.DATE, allowNull: true },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Schools', key: 'id' }
      },
      schoolSpotId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'schoolspots', key: 'id' }
      }
    },
    {
      sequelize,
      modelName: 'Student',
      tableName: 'students',
      timestamps: true,
      paranoid: true,
    }
  );

  return Student;
};

export default StudentModel;