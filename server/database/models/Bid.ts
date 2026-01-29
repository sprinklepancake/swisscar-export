// server/database/models/Bid.ts
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Bid extends Model {
  public id!: number
  public carId!: number
  public userId!: number
  public amount!: number
  public status!: 'pending' | 'won' | 'lost' | 'cancelled'
  public createdAt!: Date
  public updatedAt!: Date

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      carId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'Bid',
      tableName: 'Bids',
      timestamps: true
    })
  }
  
  public static associate() {
    // Associations will be set up in index.ts
  }
}