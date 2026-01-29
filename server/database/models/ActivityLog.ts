// server/database/models/ActivityLog.ts - COMPLETE FILE
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class ActivityLog extends Model {
  public id!: number
  public userId!: number
  public type!: string
  public action!: string
  public description!: string
  public metadata?: any
  public ipAddress?: string
  public userAgent?: string

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
      type: {
        type: DataTypes.ENUM(
          'login', 
          'logout', 
          'profile_update', 
          'car_listing', 
          'car_update', 
          'car_sold',
          'bid_placed', 
          'bid_won', 
          'bid_lost', 
          'funds_added', 
          'funds_withdrawn', 
          'message_sent', 
          'message_received',
          'watchlist_added',
          'watchlist_removed',
          'car_viewed'
        ),
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('metadata');
          return rawValue ? JSON.parse(rawValue) : {};
        },
        set(value: any) {
          this.setDataValue('metadata', JSON.stringify(value || {}));
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
      modelName: 'ActivityLog',
      tableName: 'activity_logs',
      timestamps: true,
      indexes: [
        {
          fields: ['userId']
        },
        {
          fields: ['type']
        },
        {
          fields: ['createdAt']
        }
      ]
    })
  }

  public static associate() {
    // Associations are handled in setupAssociations in index.ts
  }
}