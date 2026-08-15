import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { School } from './School';
import { User } from './User';

export interface SubscriptionPaymentAttributes {
  id: string;
  schoolId: string;
  initiatedBy: string;
  amount: number;
  phoneNumber: string;
  paypackRef: string;
  status: 'pending' | 'successful' | 'failed';
  rawWebhookPayload?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionPaymentCreationAttributes
  extends Optional<SubscriptionPaymentAttributes, 'id' | 'status' | 'rawWebhookPayload' | 'createdAt' | 'updatedAt'> {}

export class SubscriptionPayment
  extends Model<SubscriptionPaymentAttributes, SubscriptionPaymentCreationAttributes>
  implements SubscriptionPaymentAttributes
{
  public id!: string;
  public schoolId!: string;
  public initiatedBy!: string;
  public amount!: number;
  public phoneNumber!: string;
  public paypackRef!: string;
  public status!: 'pending' | 'successful' | 'failed';
  public rawWebhookPayload?: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: { School: typeof School; User: typeof User }) {
    SubscriptionPayment.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' });
    SubscriptionPayment.belongsTo(models.User, { foreignKey: 'initiatedBy', as: 'initiator' });
  }
}

export const SubscriptionPaymentModel = (sequelize: Sequelize): typeof SubscriptionPayment => {
  SubscriptionPayment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      initiatedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paypackRef: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      rawWebhookPayload: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'subscription_payments',
      modelName: 'SubscriptionPayment',
      timestamps: true,
      indexes: [
        { fields: ['schoolId'] },
        { fields: ['paypackRef'], unique: true },
        { fields: ['status'] },
      ],
    }
  );

  return SubscriptionPayment;
};

export default SubscriptionPaymentModel;
