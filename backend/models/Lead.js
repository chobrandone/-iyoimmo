const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['inquiry', 'visit_request', 'property_submission', 'contact'],
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'closed'],
    default: 'new',
  },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String },
  channel: {
    type: String,
    enum: ['whatsapp', 'form', 'email', 'phone', 'website'],
    default: 'form',
  },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  submissionData: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
