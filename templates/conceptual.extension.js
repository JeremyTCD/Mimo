/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model.jtcd_displaySocialMediaLinks = model.jtcd_githubLink || model.jtcd_twitterLink ||
        model.jtcd_instagramLink || model.jtcd_facebookLink || model.jtcd_googleplusLink;

  return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}