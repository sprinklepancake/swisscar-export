// server/database/models/Car.ts - UPDATED WITH FEATURED UNTIL FIELD
import { Model, DataTypes } from 'sequelize'
import type { Sequelize } from 'sequelize'

export class Car extends Model {
  declare id: number
  declare sellerId: number
  declare make: string
  declare model: string
  declare year: number
  declare price: number
  declare startingPrice: number
  declare mileage: number
  declare color: string
  declare condition: 'excellent' | 'good' | 'fair' | 'poor'
  declare fuelType: string
  declare transmission: string
  declare engineSize: string
  declare description: string
  declare images: string[]
  declare canton: string
  declare city: string
  declare status: 'draft' | 'active' | 'sold' | 'auction' | 'auction_ended'
  declare auctionEnd?: Date
  declare views: number
  declare isFeatured: boolean
  declare shippingCost: number
  declare exportDocuments: boolean
  
  // NEW: Featured until field
  declare featuredUntil?: Date
  
  // Typenschein fields
  declare typenscheinNr: string
  declare typenscheinData: any
  declare vehicleType: string
  declare bodyType: string
  declare powerKw: number
  declare powerPs: number
  declare cylinders: number
  declare displacement: number
  declare weightEmpty: string
  declare weightTotal: string
  declare seats: number
  declare driveType: string

  // AUCTION FIELDS
  declare listingType: 'normal' | 'auction'
  declare reservePrice: number
  declare currentBid: number
  declare highestBidderId: number
  declare bidCount: number
  declare auctionDuration: number

  // Additional fields
  declare colorExterior: string
  declare colorInterior: string
  declare doors: number
  declare withWarranty: boolean
  declare validInspection: boolean
  declare hasAccident: boolean
  declare equipment: string[]
  declare sellerType: string
  declare sellerName: string
  declare sellerPhone: string
  declare sellerEmail: string
  declare location: string
  declare zipCode: string
  declare permanentFeature: boolean

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      make: {
        type: DataTypes.STRING,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1990,
          max: new Date().getFullYear() + 1
        }
      },
      permanentFeature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      startingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      mileage: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'black'
      },
      condition: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
        allowNull: true,
        defaultValue: 'good'
      },
      fuelType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      transmission: {
        type: DataTypes.STRING,
        allowNull: false
      },
      engineSize: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '2.0L'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
          const rawValue = this.getDataValue('images');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value: string[]) {
          this.setDataValue('images', JSON.stringify(value || []));
        }
      },
      canton: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'sold', 'auction', 'auction_ended'),
        defaultValue: 'draft'
      },
      auctionEnd: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // NEW: Featured until field
      featuredUntil: {
        type: DataTypes.DATE,
        allowNull: true
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      shippingCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      exportDocuments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      // Typenschein fields
      typenscheinNr: {
        type: DataTypes.STRING,
        allowNull: true
      },
      typenscheinData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      vehicleType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bodyType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      powerKw: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      powerPs: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      cylinders: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      displacement: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      weightEmpty: {
        type: DataTypes.STRING,
        allowNull: true
      },
      weightTotal: {
        type: DataTypes.STRING,
        allowNull: true
      },
      seats: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      driveType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // AUCTION FIELDS
      listingType: {
        type: DataTypes.ENUM('normal', 'auction'),
        defaultValue: 'normal'
      },
      reservePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      currentBid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      highestBidderId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      bidCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      auctionDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 30
      },
      // Additional fields for filtering
      colorExterior: {
        type: DataTypes.STRING,
        allowNull: true
      },
      colorInterior: {
        type: DataTypes.STRING,
        allowNull: true
      },
      doors: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      withWarranty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      validInspection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      hasAccident: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      equipment: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
          const rawValue = this.getDataValue('equipment');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value: string[]) {
          this.setDataValue('equipment', JSON.stringify(value || []));
        }
      },
      sellerType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sellerName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sellerPhone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sellerEmail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Car',
      timestamps: true,
      indexes: [
        { fields: ['make'] },
        { fields: ['model'] },
        { fields: ['price'] },
        { fields: ['year'] },
        { fields: ['canton'] },
        { fields: ['status'] },
        { fields: ['typenscheinNr'] },
        { fields: ['fuelType'] },
        { fields: ['transmission'] },
        { fields: ['bodyType'] },
        { fields: ['listingType'] },
        { fields: ['auctionEnd'] },
        { fields: ['featuredUntil'] }, // NEW INDEX
        { fields: ['isFeatured'] }
      ]
    })
  }

  public static associate() {
    // Associations are handled in setupAssociations in index.ts
  }

  // NEW: Helper method to check if featured status is active
  public isFeaturedActive(): boolean {
    if (!this.isFeatured) return false
    if (!this.featuredUntil) return false
    return new Date() < new Date(this.featuredUntil)
  }

  // NEW: Get remaining featured days
  public getFeaturedDaysRemaining(): number {
    if (!this.isFeatured || !this.featuredUntil) return 0
    const now = new Date()
    const end = new Date(this.featuredUntil)
    const diffMs = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  // Helper methods for auctions (existing)
  public isAuctionActive(): boolean {
    if (this.listingType !== 'auction') return false
    if (this.status !== 'auction') return false
    if (!this.auctionEnd) return false
    
    return new Date() < new Date(this.auctionEnd)
  }

  public getTimeRemaining(): string {
    if (!this.auctionEnd || !this.isAuctionActive()) return 'Ended'
    
    const now = new Date()
    const end = new Date(this.auctionEnd)
    const diffMs = end.getTime() - now.getTime()
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  public isReserveMet(): boolean {
    if (!this.reservePrice || !this.currentBid) return false
    return this.currentBid >= this.reservePrice
  }
}