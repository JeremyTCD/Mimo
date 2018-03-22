/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model.mimo_displaySocialMediaLinks = model.mimo_githubLink || model.mimo_twitterLink ||
        model.mimo_instagramLink || model.mimo_facebookLink || model.mimo_googleplusLink;

    model.mimo_shareArticleEnabled = model.mimo_shareOnFacebook || model.mimo_shareOnTwitter;

    // Both side menus are active
    if (!model.mimo_disableArticleMenu && !model.mimo_disableSectionMenu) {
        model.mimo_outerCoreNumber = 2;
        model.mimo_innerCoreNumber = 1;
    } else if (!model.mimo_disableArticleMenu || !model.mimo_disableSectionMenu) {
        // 1 side menu is active
        model.mimo_outerCoreNumber = 1;
    } else {
        // Neither side menu is active
    }

    return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
    return model;
}