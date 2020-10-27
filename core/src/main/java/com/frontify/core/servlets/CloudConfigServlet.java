package com.frontify.core.servlets;

import com.day.cq.commons.inherit.HierarchyNodeInheritanceValueMap;
import com.day.cq.wcm.webservicesupport.Configuration;
import com.day.cq.wcm.webservicesupport.ConfigurationManager;
import com.google.gson.Gson;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Component(service = { Servlet.class })
@SlingServletPaths({"/bin/ffyconfig"})
@SlingServletResourceTypes(resourceTypes = "sling/unused", methods = HttpConstants.METHOD_GET)
public class CloudConfigServlet extends SlingSafeMethodsServlet {
    private final transient Logger log = LoggerFactory.getLogger(getClass());

    @Override
    protected void doGet(final SlingHttpServletRequest request,
                         final SlingHttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        PrintWriter wri = response.getWriter();

        Map parameters = request.getParameterMap();
        if (!parameters.containsKey("uri")) {
            wri.println("{\"error\": \"no uri provided\"}");
            response.setStatus(SlingHttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        ResourceResolver resourceResolver = request.getResourceResolver();

        RequestParameter[] uriParameters = request.getRequestParameters("uri");
        if (uriParameters != null && uriParameters.length > 0) {

            Resource res = resourceResolver.resolve(uriParameters[0].getString());

            if (ResourceUtil.isNonExistingResource(res)) {
                wri.println("{\"error\": \"resource not found\"}");
                response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                return;
            }

            //get page properties
            String[] services = new HierarchyNodeInheritanceValueMap(res)
                    .getInherited("cq:cloudserviceconfigs", new String[]{});

            log.debug("uri: {0}", uriParameters[0]);
            log.debug("res: {0}", res.getPath());
            log.debug("nb srv: {0}", services.length);

            ConfigurationManager cfgMgr = resourceResolver.adaptTo(ConfigurationManager.class);
            if (cfgMgr != null) {

                Configuration cfg = cfgMgr.getConfiguration("ffyconfig", services);

                Map<String, Object> config = new HashMap<>();

                if (cfg != null) {

                    String endPoint = cfg.get("endPoint", "");
                    String domain = cfg.get("domain", "");

                    if (StringUtils.isEmpty(endPoint)) {
                        wri.println("{\"error\": \"endPoint not configured\"}");
                        response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    config.put("domain", domain);
                    if (StringUtils.isEmpty(domain)) {
                        wri.println("{\"error\": \"domain not configured\"}");
                        response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    config.put("endPoint", endPoint);
                    config.put("domain", domain);

                } else {
                    wri.println("{\"error\": \"no configuration found\"}");
                    response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                }

                Gson gson = new Gson();
                wri.println(gson.toJson(config));
            } else {
                wri.println("{\"error\": \"no configuration found\"}");
                response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
            }
        }
    }
}
