// server/database/models/Chat.ts
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Chat extends Model {
  declare id: number
  declare carId: number
  declare sellerId: number
  declare buyerId: number
  declare lastMessageAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      carId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'cars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    }, {
      sequelize,
      modelName: 'Chat',
      tableName: 'chats',
      timestamps: true
    })
  }

  public static associate(models: any) {
    this.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' })
    this.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' })
    this.belongsTo(models.Car, { foreignKey: 'carId', as: 'car' })
    this.hasMany(models.Message, { foreignKey: 'chatId', as: 'messages' })
  }
}