// server/database/models/User.ts - JUST ADD THE MISSING PART
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class User extends Model {
  public id!: number
  public email!: string
  public password!: string
  public name!: string
  public phone!: string
  public role!: 'buyer' | 'seller' | 'admin'
  public verified!: boolean
  public funds!: number
  public verifiedBuyer!: boolean
  public banned!: boolean
  public companyName?: string
  public address?: string
  public streetAddress?: string // NEW FIELD
  public city?: string
  public canton?: string
  public zipCode?: string
  public country?: string
  public businessType?: 'private' | 'dealer' | 'business'
  public taxId?: string
  public website?: string
  public description?: string
  public profileImage?: string
  public language?: string
  public currency?: string
  public notificationPreferences?: any
  public lastLogin?: Date
  public loginCount!: number
  public totalListings!: number // ✅ This exists
  public freeFeatureCredits!: number // ✅ This exists
  public usedFreeFeatures!: number // ✅ This exists

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id' // Explicit field name
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('buyer', 'seller', 'admin'),
        defaultValue: 'buyer'
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      funds: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      verifiedBuyer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      // New fields for enhanced user profile
      companyName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      streetAddress: { // NEW FIELD ADDED
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      canton: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: 'Switzerland'
      },
      businessType: {
        type: DataTypes.ENUM('private', 'dealer', 'business'),
        allowNull: true
      },
      taxId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
      },
      totalListings: { // ✅ This exists
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      freeFeatureCredits: { // ✅ This exists
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      usedFreeFeatures: { // ✅ This exists
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'CHF'
      },
      notificationPreferences: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
          const rawValue = this.getDataValue('notificationPreferences');
          return rawValue ? JSON.parse(rawValue) : {};
        },
        set(value: any) {
          this.setDataValue('notificationPreferences', JSON.stringify(value || {}));
        }
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      loginCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    })
  }

  public static associate() {
    // Associations are handled in setupAssociations in index.ts
  }
}