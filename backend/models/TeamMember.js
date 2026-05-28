const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
  },
  photo: { type: String },
  phone: { type: String },
  email: { type: String },
  bio: {
    fr: { type: String },
    en: { type: String },
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
