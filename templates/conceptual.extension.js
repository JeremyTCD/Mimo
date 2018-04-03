/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model.mimo_displaySocialMediaLinks = model.mimo_githubLink || model.mimo_twitterLink ||
        model.mimo_instagramLink || model.mimo_facebookLink || model.mimo_googleplusLink;

    model.mimo_shareArticleEnabled = model.mimo_shareOnFacebook || model.mimo_shareOnTwitter;

    // Both side menus are active
    if (!model.mimo_disableArticleMenu && !model.mimo_disableSectionMenu) {
        model.mimo_innerCore = true;
    } else if (!model.mimo_disableSectionMenu || !model.mimo_disableArticleMenu){
        if (model.mimo_disableArticleMenu) {
            model.mimo_menuBefore = true;
        } else if (model.mimo_disableSectionMenu) {
            model.mimo_menuAfter = true;
        }
    }

    return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
    return model;
}