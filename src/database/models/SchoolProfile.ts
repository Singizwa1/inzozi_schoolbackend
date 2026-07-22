import { Sequelize, Model, DataTypes } from 'sequelize';
import { School } from './School';

export interface SchoolProfileAttributes {
  id: string;
  schoolId: string;
  description?: string;
  mission?: string;
  vision?: string;
  foundedYear?: number;
  accreditation?: string;
  languagesOffered?: string[];
  extracurriculars?: string[];
  profilePhoto?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SchoolProfileCreationAttributes
  extends Omit<SchoolProfileAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export class SchoolProfile extends Model<SchoolProfileAttributes, SchoolProfileCreationAttributes>
  implements SchoolProfileAttributes {
  public id!: string;
  public schoolId!: string;
  public description?: string;
  public mission?: string;
  public vision?: string;
  public foundedYear?: number;
  public accreditation?: string;
  public languagesOffered?: string[];
  public extracurriculars?: string[];
  public profilePhoto?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static associate(models: { School: typeof School }) {
    SchoolProfile.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' });
  }
}

export const SchoolProfileModel = (sequelize: Sequelize) => {
  SchoolProfile.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      schoolId: { type: DataTypes.UUID, allowNull: false, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      description: { type: DataTypes.TEXT, allowNull: true },
      mission: { type: DataTypes.TEXT, allowNull: true },
      vision: { type: DataTypes.TEXT, allowNull: true },
      foundedYear: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1800, max: new Date().getFullYear() } },
      accreditation: { type: DataTypes.STRING, allowNull: true },
      languagesOffered: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      extracurriculars: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      profilePhoto: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: true } },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize,
         modelName: 'SchoolProfile',
          tableName: 'schoolProfiles',
           timestamps: true, 
              paranoid: true 
    }
  );

  return SchoolProfile;
};
