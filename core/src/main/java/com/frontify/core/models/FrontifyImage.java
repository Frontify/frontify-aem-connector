package com.frontify.core.models;


import com.frontify.core.util.LinkUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.settings.SlingSettingsService;

@Model(adaptables = SlingHttpServletRequest.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class FrontifyImage {

    @Self
    private SlingHttpServletRequest request;

    @OSGiService
    private SlingSettingsService slingSettingsService;

    @ValueMapValue
    private String alt;

    @ValueMapValue
    private String linkURL;

    @ValueMapValue
    private String fileReference;

    @ValueMapValue
    private String width;

    @ValueMapValue
    private String height;

    @ValueMapValue
    private String focalPoint;

    public String getAlt() {
        return alt;
    }

    public boolean hasLinkUrl() {
        return StringUtils.isNotEmpty(linkURL);
    }

    public String getLinkUrl() {
        return LinkUtil.externalizePath(request, linkURL, slingSettingsService);
    }

    private String getHeight() {
        return String.valueOf(NumberUtils.toInt(height));
    }

    //leave height attribute out if it is not needed (auto height)
    private void appendHeightAttribute(String height, StringBuilder builder) {
        if (!StringUtils.isEmpty(height) && !"0".equals(height)) {
            builder.append("&height=").append(height);
        }
    }

    private void appendFocalPointAttribute(String focalPoint, StringBuilder builder) {
        if (!StringUtils.isEmpty(focalPoint)) {
            builder.append("&fp=").append(focalPoint);
        }
    }

    public String getFileReference() {
        if (fileReference != null) {
            String definedHeight = getHeight();
            //not sure how height works in fileReferences, so keep the string replacement in
            String fileReferenceParsed = this.fileReference
                    .replace("{width}", width)
                    .replace("{height}", definedHeight);
            StringBuilder builder = new StringBuilder(fileReferenceParsed);
            appendHeightAttribute(definedHeight, builder);
            appendFocalPointAttribute(focalPoint, builder);
            return builder.toString();
        }
        return StringUtils.EMPTY;
    }
}
