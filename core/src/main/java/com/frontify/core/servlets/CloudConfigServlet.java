package com.frontify.core.servlets;

import static com.adobe.cq.xf.ExperienceFragmentsConstants.PN_CLOUD_SERVICE_CONFIGS;
import static org.apache.sling.jcr.contentloader.ContentTypeUtil.TYPE_JSON;

import com.day.cq.commons.inherit.ComponentInheritanceValueMap;
import com.day.cq.commons.inherit.HierarchyNodeInheritanceValueMap;
import com.day.cq.wcm.webservicesupport.Configuration;
import com.day.cq.wcm.webservicesupport.ConfigurationManager;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.Servlet;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.request.RequestParameter;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceUtil;
import org.apache.sling.api.servlets.HttpConstants;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.servlets.annotations.SlingServletPaths;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Component;

@Slf4j
@Component(service = { Servlet.class })
@SlingServletPaths({"/bin/ffyconfig"})
@SlingServletResourceTypes(resourceTypes = "sling/unused", methods = HttpConstants.METHOD_GET)
public class CloudConfigServlet extends SlingSafeMethodsServlet {

    public static final String URI = "uri";
    public static final String DOMAIN = "domain";
    public static final String END_POINT = "endPoint";
    public static final String ERROR_NO_URI_PROVIDED = "{\"error\": \"no uri provided\"}";
    public static final String ERROR_NO_CONFIGURATION_FOUND = "{\"error\": \"no configuration found\"}";
    public static final String ERROR_END_POINT_NOT_CONFIGURED = "{\"error\": \"endPoint not configured\"}";
    public static final String ERROR_RESOURCE_NOT_FOUND = "{\"error\": \"resource not found\"}";
    public static final String ERROR_DOMAIN_NOT_CONFIGURED = "{\"error\": \"domain not configured\"}";

    @Override
    protected void doGet(final SlingHttpServletRequest request,
                         final SlingHttpServletResponse response) throws IOException {

        response.setContentType(TYPE_JSON);
        PrintWriter writer = response.getWriter();

        Map<String, String[]> parameters = request.getParameterMap();
        if (!parameters.containsKey(URI)) {
            writer.println(ERROR_NO_URI_PROVIDED);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        ResourceResolver resourceResolver = request.getResourceResolver();

        RequestParameter[] uriParameters = request.getRequestParameters(URI);
        if (uriParameters != null && uriParameters.length > 0) {

            Resource res = resourceResolver.resolve(uriParameters[0].getString());

            if (ResourceUtil.isNonExistingResource(res)) {
                writer.println(ERROR_RESOURCE_NOT_FOUND);
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            //get cloud config if it's set on page
            String[] cloudServices = new HierarchyNodeInheritanceValueMap(res)
                    .getInherited(PN_CLOUD_SERVICE_CONFIGS, new String[]{});

            //get cloud config if it's set on folder
            if (cloudServices == null || cloudServices.length == 0) {
                cloudServices = new ComponentInheritanceValueMap(res)
                    .getInherited(PN_CLOUD_SERVICE_CONFIGS, new String[]{});
            }

            log.debug("uri: {}", uriParameters[0]);
            log.debug("res: {}", res.getPath());
            log.debug("nb srv: {}", cloudServices.length);

            ConfigurationManager configurationManager = resourceResolver.adaptTo(ConfigurationManager.class);
            if (configurationManager != null) {

                Configuration configuration = configurationManager.getConfiguration("ffyconfig", cloudServices);

                Map<String, Object> configMap = new HashMap<>();

                if (configuration != null) {

                    String endPoint = configuration.get(END_POINT, "");
                    String domain = configuration.get(DOMAIN, "");

                    if (StringUtils.isEmpty(endPoint)) {
                        writer.println(ERROR_END_POINT_NOT_CONFIGURED);
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    configMap.put(DOMAIN, domain);
                    if (StringUtils.isEmpty(domain)) {
                        writer.println(ERROR_DOMAIN_NOT_CONFIGURED);
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    configMap.put(END_POINT, endPoint);
                    configMap.put(DOMAIN, domain);

                } else {
                    writer.println(ERROR_NO_CONFIGURATION_FOUND);
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                }

                Gson gson = new Gson();
                writer.println(gson.toJson(configMap));
            } else {
                writer.println(ERROR_NO_CONFIGURATION_FOUND);
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        }
    }
}
