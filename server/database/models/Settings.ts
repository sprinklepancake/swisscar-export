// server/database/models/Settings.ts - UPDATED
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Settings extends Model {
  declare key: string
  declare value: string
  declare description: string
  declare category: string
  declare dataType: string
  declare isPublic: boolean
  declare updatedBy: number
  
  public static initialize(sequelize: Sequelize) {
    this.init({
      key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: 'general'
      },
      dataType: {
        type: DataTypes.STRING,
        defaultValue: 'string'
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Settings',
      tableName: 'settings',
      timestamps: true
    })
  }

  // Static method to get a setting with default value
  public static async getSetting(key: string, defaultValue?: any): Promise<any> {
    try {
      const setting = await this.findByPk(key)
      if (!setting || !setting.getDataValue('value')) {
        return defaultValue
      }
      
      const value = setting.getDataValue('value')
      const dataType = setting.getDataValue('dataType') || 'string'
      
      // Convert value based on dataType
      switch (dataType) {
        case 'number':
          return parseFloat(value) || defaultValue
        case 'boolean':
          return value === 'true' || value === '1' || value === true
        case 'json':
          try {
            return JSON.parse(value)
          } catch {
            return defaultValue
          }
        default:
          return value || defaultValue
      }
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error)
      return defaultValue
    }
  }

  // Static method to set a setting
  public static async setSetting(
    key: string, 
    value: any, 
    options?: {
      description?: string
      category?: string
      dataType?: string
      isPublic?: boolean
      updatedBy?: number
    }
  ): Promise<Settings> {
    try {
      const dataType = options?.dataType || typeof value === 'number' ? 'number' : 
                      typeof value === 'boolean' ? 'boolean' : 'string'
      
      const stringValue = dataType === 'boolean' ? String(value) : 
                         dataType === 'number' ? String(value) :
                         dataType === 'json' ? JSON.stringify(value) : 
                         value
      
      const [setting, created] = await this.upsert({
        key,
        value: stringValue,
        description: options?.description || '',
        category: options?.category || 'general',
        dataType,
        isPublic: options?.isPublic || false,
        updatedBy: options?.updatedBy
      })
      
      return setting
    } catch (error) {
      console.error(`Error setting setting ${key}:`, error)
      throw error
    }
  }

  // Helper method to get typed value
  public getTypedValue(): any {
    const value = this.getDataValue('value')
    const dataType = this.getDataValue('dataType') || 'string'
    
    switch (dataType) {
      case 'number':
        return parseFloat(value)
      case 'boolean':
        return value === 'true' || value === '1' || value === true
      case 'json':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      default:
        return value
    }
  }
}