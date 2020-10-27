<%@page contentType="text/html"
        pageEncoding="utf-8" %>
<%
%>
<%@include file="/libs/foundation/global.jsp" %>

<div>
    <h3>Frontify config settings</h3>
    <ul>
        <li>
            <strong>Frontify end point: </strong><%= xssAPI.encodeForHTML(properties.get("endPoint", "")) %>
        </li>
        <li>
            <strong>Frontify domain: </strong><%= xssAPI.encodeForHTML(properties.get("domain", "")) %>
        </li>

    </ul>
</div>