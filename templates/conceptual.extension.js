/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    model.mimo_displaySocialMediaLinks = model.mimo_githubLink || model.mimo_twitterLink ||
        model.mimo_instagramLink || model.mimo_facebookLink || model.mimo_googleplusLink;

    model.mimo_shareArticleEnabled = model.mimo_shareOnFacebook || model.mimo_shareOnTwitter;

    // Construct text for twitter intent
    if (model.mimo_shareOnTwitter) {
        var generatedText;

        // Text
        if (model.mimo_shareOnTwitter.text) {
            generatedText = model.mimo_shareOnTwitter.text;
        } else {
            generatedText = model.mimo_pageTitle;
        }

        // Via
        if (model.mimo_shareOnTwitter.via) {
            generatedText += '\n\n';
            generatedText += 'via @' + model.mimo_shareOnTwitter.via;
        }

        // Hashtags
        if (model.mimo_shareOnTwitter.hashtags) {
            generatedText += '\n\n';
            var hashtags = model.mimo_shareOnTwitter.hashtags.split(',');
            for (var i = 0; i < hashtags.length; i++) {
                generatedText += '#' + hashtags[i];

                if (i < hashtags.length - 1) {
                    generatedText += ' ';
                }
            }
        }

        // Url
        generatedText += '\n\n';
        generatedText += model.mimo_baseUrl + '/' + model.mimo_pageRelPath;

        model.mimo_shareOnTwitterText = encodeURIComponent(generatedText);
    }

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

        for (i = 0; i < segments.length; i++) {
            var segment = segments[i];
            logoWebsiteNameMarkup += segment.toUpperCase();

            if (i !== segments.length - 1) {
                logoWebsiteNameMarkup += '.<br>';
            }
        }

        model.mimo_logoWebsiteNameMarkup = logoWebsiteNameMarkup;
    }

    // Resolve font preloads
    var fontPreloads = Array.isArray(model.mimo_defaultFontPreloads) ? model.mimo_defaultFontPreloads : [];
    if (Array.isArray(model.mimo_additionalFontPreloads)) {
        for (i = 0; i < model.mimo_additionalFontPreloads.length; i++) {
            fontPreloads.push(model.mimo_additionalFontPreloads[i]);
        }
    }
    if (Array.isArray(model.mimo_unneededFontPreloads)) {
        for (i = fontPreloads.length; i > -1; i--) {
            if (model.mimo_unneededFontPreloads.indexOf(fontPreloads[i]) !== -1) {
                fontPreloads.splice(i, 1);
            }
        }
    }
    model.mimo_fontPreloads = fontPreloads;

    return model;
};

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
    return model;
};