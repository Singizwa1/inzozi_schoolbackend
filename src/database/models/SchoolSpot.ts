import { Sequelize, Model, DataTypes } from 'sequelize';
import { School } from './School';

export interface AdmissionConditions {
  minGrade?: string;
  requiredSubjects?: string[];
  examScore?: string;
  yearofstudy?:string;
  interviewRequired?: boolean;
  documents?: string[];
  notes?: string;
}

export interface SchoolSpotAttributes {
  id: string;
  schoolId: string;
  level: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
  studentType: 'newcomer' | 'transfer';
  yearofstudy:string;
  academicYear: string;
  totalSpots: number;
  occupiedSpots?: number;
  registrationOpen?: boolean;
  waitingListCount?: number;
  combination?: string[];
  admissionConditions?: AdmissionConditions;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  availableSpots?: number;
}

export interface SchoolSpotCreationAttributes
  extends Omit<
    SchoolSpotAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'availableSpots'
  > {
  id?: string;
  occupiedSpots?: number;       
  registrationOpen?: boolean;   
  waitingListCount?: number;    
  combination?: string[];       
  admissionConditions?: AdmissionConditions; 
  availableSpots?: number;
}


export class SchoolSpot extends Model<SchoolSpotAttributes, SchoolSpotCreationAttributes>
  implements SchoolSpotAttributes {
  public id!: string;
  public schoolId!: string;
  public level!: 'Nursery' | 'Primary' | 'O-level' | 'A-level';
  public studentType!: 'newcomer' | 'transfer';
  public yearofstudy!: string;
  public academicYear!: string;
  public totalSpots!: number;
  public occupiedSpots!: number;
  public registrationOpen!: boolean;
  public waitingListCount?: number;
  public combination?: string[];
  public admissionConditions?: AdmissionConditions;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public get availableSpots(): number {
    return this.totalSpots - this.occupiedSpots;
  }

  public static associate(models: { School: typeof School }) {
    SchoolSpot.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' });
  }
}

export const SchoolSpotModel = (sequelize: Sequelize) => {
  SchoolSpot.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      schoolId: { type: DataTypes.UUID, allowNull: false },
      level: { type: DataTypes.ENUM('Nursery', 'Primary', 'O-level', 'A-level'), allowNull: false },
      studentType: { type: DataTypes.ENUM('newcomer', 'transfer'), allowNull: false },
      yearofstudy:{type:DataTypes.STRING,allowNull:false},
      academicYear: { type: DataTypes.STRING, allowNull: false },
      totalSpots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      occupiedSpots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      registrationOpen: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      waitingListCount: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      combination: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      admissionConditions: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'SchoolSpot',
      tableName: 'schoolspots',
      timestamps: true,
      paranoid: true,
      indexes: [
        { fields: ['schoolId'] },
        { fields: ['academicYear'] },
        { fields: ['level'] },
        {
          unique: true,
          fields: ['schoolId', 'academicYear', 'level', 'studentType', 'combination', 'yearofstudy'],
          name: 'unique_school_spot_per_category',
        },
      ],
    }
  );

  return SchoolSpot;
};
