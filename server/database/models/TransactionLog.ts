// server/database/models/TransactionLog.ts - Make sure it has this structure
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class TransactionLog extends Model {
  public id!: number
  public userId!: number
  public adminId?: number
  public type!: string
  public amount!: number
  public previousBalance!: number
  public newBalance!: number
  public description!: string
  public referenceId?: string
  public metadata?: any
  public status!: string

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [[
            'deposit', 'withdrawal', 'payment', 'refund',
            'listing_fee', 'auction_fee', 'feature_payment',
            'permanent_feature_payment', 'bid_payment',
            'admin_adjustment', 'free_feature'
          ]]
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      previousBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      newBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'completed',
        validate: {
          isIn: [['pending', 'completed', 'failed', 'refunded', 'cancelled']]
        }
      }
    }, {
      sequelize,
      modelName: 'TransactionLog',
      tableName: 'transaction_logs',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['type'] },
        { fields: ['referenceId'] },
        { fields: ['createdAt'] },
        { fields: ['status'] }
      ]
    })
  }

  public static associate() {
    // These associations are set in the index.ts file
  }
}