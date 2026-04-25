function userProfile(req, res) {
  return res.json({
    message: "User profile",
    user: req.user,
  });
}

module.exports = {
  userProfile,
};
