const mongoose = require('mongoose');

const EcosystemProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['ready', 'coming_soon'],
    default: 'coming_soon'
  },
  moduleKey: { type: String, required: true, unique: true } // e.g., 'smajstore'
}, {
  timestamps: true
});

// You can pre-populate this collection with your projects
// e.g., in a seeder script.

const EcosystemProject = mongoose.model('EcosystemProject', EcosystemProjectSchema);

module.exports = EcosystemProject;