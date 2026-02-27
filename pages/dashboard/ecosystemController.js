const EcosystemProject = require('../models/EcosystemProject');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/ecosystem/projects
 * Get status of all ecosystem projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await EcosystemProject.find().sort({ name: 1 });
  res.status(200).json({ success: true, projects });
});

module.exports = {
  getProjects,
};