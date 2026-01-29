// server/database/models/Watchlist.ts
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Watchlist extends Model {
  public id!: number
  public userId!: number
  public carId!: number
  public notified!: boolean
  public priceAlert?: number
  public notes?: string

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
      carId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      notified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      priceAlert: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Watchlist',
      tableName: 'watchlists',
      timestamps: true,
      indexes: [
        {
          fields: ['userId']
        },
        {
          fields: ['carId']
        },
        {
          fields: ['userId', 'carId'],
          unique: true // Prevent duplicate entries
        }
      ]
    })
  }

  public static associate() {
    // Associations are handled in setupAssociations in index.ts
  }
}