import { Sequelize, Model, DataTypes } from 'sequelize';
import { School } from './School';

export interface SchoolGalleryAttributes {
  id: string;
  schoolId: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SchoolGalleryCreationAttributes
  extends Omit<SchoolGalleryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  id?: string;
}

export class SchoolGallery extends Model<SchoolGalleryAttributes, SchoolGalleryCreationAttributes>
  implements SchoolGalleryAttributes {
  public id!: string;
  public schoolId!: string;
  public imageUrl!: string;
  public category!: SchoolGalleryAttributes['category'];
  public caption?: string;
  public isFeatured!: boolean;
  public order?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static associate(models: { School: typeof School }) {
    SchoolGallery.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school', onDelete: 'CASCADE' });
  }
}

export const SchoolGalleryModel = (sequelize: Sequelize) => {
  SchoolGallery.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      schoolId: { type: DataTypes.UUID, allowNull: false },
      imageUrl: { type: DataTypes.STRING, allowNull: false },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [[
            'classroom', 'computerLab', 'library', 'sports', 'dining',
            'dormitory', 'administration', 'playground'
          ]],
        },
      },
      caption: { type: DataTypes.STRING, allowNull: true },
      isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
      order: { type: DataTypes.INTEGER, allowNull: true, validate: { isInt: true, min: 0 } },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: 'schoolgalleries',
      modelName: 'SchoolGallery',
      timestamps: true,
      paranoid: true,
      indexes: [
        { fields: ['schoolId'] },
        { fields: ['category'] },
        { fields: ['isFeatured'] },
        { fields: ['schoolId', 'order'] },
      ],
    }
  );

  return SchoolGallery;
};
