import { Sequelize, Model, DataTypes, Optional } from 'sequelize';

export interface SubscriptionSettingAttributes {
  id: string;
  trialPeriodMonths: number;
  billingPeriodMonths: number;
  subscriptionFee: number;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionSettingCreationAttributes
  extends Optional<
    SubscriptionSettingAttributes,
    'id' | 'trialPeriodMonths' | 'billingPeriodMonths' | 'subscriptionFee' | 'updatedBy' | 'createdAt' | 'updatedAt'
  > {}

export class SubscriptionSetting
  extends Model<SubscriptionSettingAttributes, SubscriptionSettingCreationAttributes>
  implements SubscriptionSettingAttributes
{
  public id!: string;
  public trialPeriodMonths!: number;
  public billingPeriodMonths!: number;
  public subscriptionFee!: number;
  public updatedBy?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(_models: any) {}
}

export const SubscriptionSettingModel = (sequelize: Sequelize): typeof SubscriptionSetting => {
  SubscriptionSetting.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      trialPeriodMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      billingPeriodMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      subscriptionFee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'subscription_settings',
      modelName: 'SubscriptionSetting',
      timestamps: true,
    }
  );

  return SubscriptionSetting;
};

export default SubscriptionSettingModel;
