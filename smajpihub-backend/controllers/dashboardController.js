const config = require('../config');
const { generateDashboardSSOToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

function normalizeRedirect(value) {
  if (!value) return '';
  try {
    const dashboardUrl = new URL(config.dashboard.host);
    const resolved = new URL(value, dashboardUrl);
    if (resolved.origin !== dashboardUrl.origin) return '';
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path;
  } catch (_) {
    return '';
  }
}

const createDashboardSSOToken = asyncHandler(async (req, res) => {
  const user = req.user;
  const redirect = normalizeRedirect(req.query.redirect);

  const { token, expiresAt, expiresIn } = generateDashboardSSOToken(user);
  const dashboardUrl = new URL(config.dashboard.host);
  dashboardUrl.searchParams.set('token', token);
  if (redirect) {
    dashboardUrl.searchParams.set('redirect', redirect);
  }

  res.status(200).json({
    success: true,
    message: 'Dashboard SSO token generated.',
    token,
    expiresAt,
    expiresIn,
    redirectUrl: dashboardUrl.toString()
  });
});

module.exports = {
  createDashboardSSOToken
};
