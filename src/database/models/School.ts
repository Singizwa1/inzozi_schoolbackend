import { Sequelize, DataTypes, Model } from "sequelize";
import { User } from "./User";
import { SchoolGallery } from "./SchoolGallery";
import { SchoolProfile } from "./SchoolProfile";
import { SchoolSpot } from "./SchoolSpot";

export interface SchoolAttributes {
  id: string;
  schoolName: string;
  schoolCode: string;
  schoolCategory?: "REB" | "RTB" | null;
  schoolLevel?: "Nursery" | "Primary" | "O-Level" | "A-Level" | null;
  schoolType?: "Girls" | "Boys" | "Mixed" | null;
  province?: string | null;
  district: string;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  email: string;
  telephone?: string | null;
  status:"not_registered"| "pending" |  "approved" | "rejected"; 
  rejectedReason?: string | null;
  licenseDocument?: string | null;
  userId: string;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreationAttributes
  extends Omit<
    SchoolAttributes,
    | "id"
    | "status"
    |"licenseDocument"
    | "approvedBy"
    | "approvedAt"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"

  > {
  id?: string;
  licenseDocument?: string;
  status?: "not_registered"|"pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date | null;
}

export class School extends Model<SchoolAttributes, CreationAttributes> {
  public id!: string;
  public schoolName!: string;
  public schoolCode!: string;
  public schoolCategory?: "REB" | "RTB";
  public schoolLevel?: "Nursery" | "Primary" | "O-Level" | "A-Level";
  public schoolType?: "Girls" | "Boys" | "Mixed";
  public province?: string;
  public district!: string;
  public sector?: string;
  public cell?: string;
  public village?: string;
  public email!: string;
  public telephone?: string;
  public status!: "not_registered"|"pending" | "approved" | "rejected";
  public licenseDocument?: string;
  public userId!: string;
  public approvedBy?: string | null;
  public rejectedReason?: string | null;
  public approvedAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date | null;

  static associate(models: { User: typeof User;SchoolProfile: typeof SchoolProfile; SchoolGallery: typeof SchoolGallery; SchoolSpot: typeof SchoolSpot }) {
    School.belongsTo(models.User, {
      foreignKey: "userId",
      as: "SchoolManager",
    });
    School.belongsTo(models.User, {
      foreignKey: "approvedBy",
      as: "ApprovedByAdmin",
    });
    School.hasMany(models.User, { foreignKey: 'schoolId', as: 'AdmissionManager' });

     School.hasOne(models.SchoolProfile, { foreignKey: 'schoolId', as: 'profile' });
    School.hasMany(models.SchoolGallery, { foreignKey: 'schoolId', as: 'gallery' });
    School.hasMany(models.SchoolSpot, { foreignKey: 'schoolId', as: 'spots' });
  }

  }
  


export const SchoolModel = (sequelize: Sequelize) => {
  School.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      schoolName: { type: DataTypes.STRING, allowNull: false },
      schoolCode: { type: DataTypes.STRING, allowNull: false, unique: true },
      schoolCategory: {
        type: DataTypes.ENUM("REB", "RTB"),
        allowNull: true,
      },
      schoolLevel: {
        type: DataTypes.ENUM("Nursery", "Primary", "O-Level", "A-Level"),
        allowNull: true,
      },
      schoolType: {
        type: DataTypes.ENUM("Girls", "Boys", "Mixed"),
        allowNull: true,
      },
      province: { type: DataTypes.STRING, allowNull: true },
      district: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: true },
      cell: { type: DataTypes.STRING, allowNull: true },
      village: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      telephone: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM("not_registered","pending",  "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      approvedAt: { type: DataTypes.DATE, allowNull: true },
      rejectedReason: { type: DataTypes.STRING, allowNull: true },
      licenseDocument: { type: DataTypes.STRING, allowNull: true },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: "schools",
      modelName: "School",
      timestamps: true,
      paranoid: true,
      indexes: [
        { fields: ["schoolCode"], unique: true },
        { fields: ["email"], unique: true },
        { fields: ["status"] },
        { fields: ["approvedBy"] },
      ],
    }
  );

  return School;
};
