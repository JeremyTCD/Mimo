/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model['jtcd.displaySocialMediaLinks'] = model['jtcd.githubLink'] || model['jtcd.twitterLink'] ||
        model['jtcd.instagramLink'] || model['jtcd.facebookLink'] || model['jtcd.googleplusLink'];

  return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}