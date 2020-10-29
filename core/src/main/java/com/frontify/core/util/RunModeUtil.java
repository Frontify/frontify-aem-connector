package com.frontify.core.util;

import com.day.cq.commons.Externalizer;
import org.apache.sling.settings.SlingSettingsService;

public class RunModeUtil {

    private RunModeUtil() {}

    /**
     * Determines if the current AEM instance has the 'author' runmode enabled.
     *
     * @param settingsService object so that run mode is checked
     * @return TRUE when the 'author' runmode is enabled.
     */
     static boolean isAuthorMode(SlingSettingsService settingsService) {
         return settingsService != null && settingsService.getRunModes() != null && settingsService.getRunModes().contains(Externalizer.AUTHOR);
     }

    /**
     * Determines if the current AEM instance has the 'publish' runmode enabled.
     *
     * @param settingsService object so that run mode is checked
     * @return TRUE when the 'publish' runmode is enabled.
     */
    static boolean isPublishMode(SlingSettingsService settingsService) {
        return settingsService != null && settingsService.getRunModes() != null && settingsService.getRunModes().contains(Externalizer.PUBLISH);
    }

    /**
     * Determines if the current AEM instance has the 'local' runmode enabled.
     *
     * @param settingsService object so that run mode is checked
     * @return TRUE when the 'local' runmode is enabled.
     */
    public static boolean isLocalMode(SlingSettingsService settingsService) {
        return settingsService != null && settingsService.getRunModes() != null && settingsService.getRunModes().contains(Externalizer.LOCAL);
    }


}
