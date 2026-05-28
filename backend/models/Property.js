const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  refId: { type: String, unique: true },
  title: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
  },
  intent: {
    type: String,
    enum: ['rent', 'buy', 'land'],
    required: true,
  },
  type: {
    type: String,
    enum: ['apartment', 'villa', 'house', 'land', 'commercial'],
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'rented', 'sold'],
    default: 'available',
  },
  price: { type: Number, required: true },
  priceUnit: { type: String, enum: ['month', 'total'], default: 'month' },
  neighbourhood: { type: String, required: true },
  address: { type: String },
  city: { type: String, default: 'Bangui' },
  specs: {
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number },
    parking: { type: Number, default: 0 },
    yearBuilt: { type: Number },
  },
  amenities: {
    airConditioning: { type: Boolean, default: false },
    generator: { type: Boolean, default: false },
    waterTank: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    fibreInternet: { type: Boolean, default: false },
    equippedKitchen: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
  },
  images: [{ type: String }],
  coverImage: { type: String },
  virtualTour: { type: String },
  floorPlan: { type: String },
  documents: [{ name: String, url: String }],
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  nearby: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [18.5582, 4.3612] },
  },
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ intent: 1, status: 1, isPublished: 1 });

propertySchema.pre('save', function (next) {
  if (!this.refId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    this.refId = `IYO-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);
