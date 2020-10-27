package com.frontify.core.models;


import com.frontify.core.util.LinkUtil;
import org.apache.commons.lang3.StringUtils;
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
        return height == null || height.equals("0") ? "auto" : height;
    }

    public String getFileReference() {
        if(fileReference != null){
            String height = getHeight();
            String fileRefecenceParsed = this.fileReference.replaceAll("\\{width\\}", width).replaceAll("\\{height\\}", height);
            StringBuilder builder = new StringBuilder(fileRefecenceParsed);
            if (!StringUtils.isAllEmpty(height) && !"0".equals(height)) {
                builder.append("&height=").append(height);
            }
            return builder.toString();
        }
       return StringUtils.EMPTY;
    }


}
