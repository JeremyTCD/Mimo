/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model.mimo_displaySocialMediaLinks = model.mimo_githubLink || model.mimo_twitterLink ||
        model.mimo_instagramLink || model.mimo_facebookLink || model.mimo_googleplusLink;

    model.mimo_shareArticleEnabled = model.mimo_shareOnFacebook || model.mimo_shareOnTwitter;

    // Both side menus are active
    if (!model.mimo_disableArticleMenu && !model.mimo_disableCategoryMenu) {
        model.mimo_innerCore = true;
    } else if (!model.mimo_disableCategoryMenu || !model.mimo_disableArticleMenu) {
        if (model.mimo_disableArticleMenu) {
            model.mimo_menuBefore = true;
        } else if (model.mimo_disableCategoryMenu) {
            model.mimo_menuAfter = true;
        }
    }

    // Include website name in logo
    if (!model.mimo_disableWebsiteNameInLogo) {
        var logoWebsiteNameMarkup = '';
        var segments = model.mimo_websiteName.split('.');

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            logoWebsiteNameMarkup += segment.toUpperCase();

            if (i !== segments.length - 1) {
                logoWebsiteNameMarkup += '.<br>';
            }
        }

        model.mimo_logoWebsiteNameMarkup = logoWebsiteNameMarkup;
    }

    return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
    return model;
}