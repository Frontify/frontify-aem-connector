package com.frontify.core.util;

import com.day.cq.commons.Externalizer;
import com.day.cq.wcm.api.PageManager;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.settings.SlingSettingsService;

import java.util.Optional;

@Slf4j
public final class LinkUtil {
    private static final String HTML_EXTENSION = ".html";

    private LinkUtil() {
    }

    public static String externalizePath(SlingHttpServletRequest request, String path, SlingSettingsService settingsService) {
        final ResourceResolver resourceResolver = request.getResourceResolver();
        if (isPage(path, resourceResolver)) {
            path = path.concat(HTML_EXTENSION);
        }

        final Externalizer externalizer = resourceResolver.adaptTo(Externalizer.class);
        if (externalizer != null) {
            if (RunModeUtil.isAuthorMode(settingsService)) {
                return externalizer.authorLink(resourceResolver, path);
            } else if (RunModeUtil.isPublishMode(settingsService)) {
                return externalizer.publishLink(resourceResolver, path);
            }
            return externalizer.externalLink(resourceResolver, Externalizer.LOCAL, path);
        } else {
            return StringUtils.EMPTY;
        }


    }

    private static boolean isPage(String path, ResourceResolver resourceResolver) {
        return Optional.ofNullable(resourceResolver.adaptTo(PageManager.class))
                .map(pm -> pm.getPage(path)).isPresent();
    }

}

