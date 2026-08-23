import { Sequelize, Model, DataTypes } from 'sequelize';

export interface TranslationCacheAttributes {
  id: string;
  sourceHash: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TranslationCacheCreationAttributes
  extends Omit<TranslationCacheAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export class TranslationCache
  extends Model<TranslationCacheAttributes, TranslationCacheCreationAttributes>
  implements TranslationCacheAttributes {
  public id!: string;
  public sourceHash!: string;
  public targetLang!: string;
  public sourceText!: string;
  public translatedText!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const TranslationCacheModel = (sequelize: Sequelize) => {
  TranslationCache.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      sourceHash: { type: DataTypes.STRING(64), allowNull: false },
      targetLang: { type: DataTypes.STRING(5), allowNull: false },
      sourceText: { type: DataTypes.TEXT, allowNull: false },
      translatedText: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      sequelize,
      tableName: 'translation_cache',
      modelName: 'TranslationCache',
      timestamps: true,
      indexes: [{ fields: ['sourceHash', 'targetLang'], unique: true }],
    }
  );

  return TranslationCache;
};
