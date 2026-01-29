// server/database/models/AdminLog.ts
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class AdminLog extends Model {
  public id!: number
  public adminId!: number
  public action!: string
  public resourceType!: 'user' | 'listing' | 'transaction' | 'system'
  public resourceId?: number
  public details!: any
  public ipAddress?: string
  public userAgent?: string

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      resourceType: {
        type: DataTypes.ENUM('user', 'listing', 'transaction', 'system'),
        allowNull: false
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const rawValue = this.getDataValue('details')
          return rawValue ? JSON.parse(rawValue) : {}
        },
        set(value: any) {
          this.setDataValue('details', JSON.stringify(value || {}))
        }
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'AdminLog',
      tableName: 'admin_logs',
      timestamps: true,
      indexes: [
        { fields: ['adminId'] },
        { fields: ['resourceType', 'resourceId'] },
        { fields: ['createdAt'] }
      ]
    })
  }

  public static associate() {
    // Will be set up in index.ts
  }
}