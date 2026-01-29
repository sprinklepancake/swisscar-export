// server/database/models/Message.ts
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Message extends Model {
  declare id: number
  declare carId: number
  declare sellerId: number
  declare buyerId: number
  declare lastMessageAt?: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'id'
        }
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    }, {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      timestamps: true
    })
  }

  public static associate() {
    // Empty - associations handled in setupAssociations
  }
}