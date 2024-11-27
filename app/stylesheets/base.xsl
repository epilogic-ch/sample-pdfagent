<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8"/>

    <xsl:include href="constants.xsl"/>

    <xsl:key name="labels-base" match="/output/bundles/bundle[@name='base']/label" use="@key"/>

    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!doctype html&gt;</xsl:text>
        <html lang="{/output/session/@locale}">
            <xsl:call-template name="html-head"/>
            <xsl:call-template name="html-body"/>
        </html>
    </xsl:template>

    <xsl:template name="html-head">
        <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>

            <!-- add "no-js" class on "html" when javascript is not available -->
            <script>(function(e,t,n){var r=e.querySelectorAll("html")[0];r.className=r.className.replace(/(^|\s)no-js(\s|$)/,"$1js$2")})(document,window,0);</script>

            <!-- bootstrap -->
            <link rel="stylesheet" href="{$resources-url}/bootstrap-icons-1.11.3/font/bootstrap-icons.css?v={$version}"></link>
            <link rel="stylesheet" href="{$resources-url}/bootstrap/css/bootstrap.min.css"/>
            <script src="{$resources-url}/bootstrap/js/bootstrap.bundle.min.js"></script>

            <!-- pdfjs -->
            <script type="module" src="{$resources-url}/js/pdfjs/build/pdf.mjs"></script>

            <!-- ewt -->
            <script type="text/javascript" src="{$resources-url}/js/ewt.js?v={$version}"></script>
            <script type="text/javascript" src="{$resources-url}/js/pdf.js?v={$version}"></script>

            <title><xsl:value-of select="/output/application/name"/></title>

            <xsl:call-template name="build-js-settings"/>
            <xsl:call-template name="html-head-custom"/>
        </head>
    </xsl:template>

    <xsl:template name="html-body">
        <body>
            <form id="form" method="post" accept-charset="UTF-8" enctype="multipart/form-data" autocomplete="off">
                <xsl:call-template name="hidden-fields"/>

                <xsl:call-template name="html-body-custom"/>
                <xsl:call-template name="html-foot-custom"/>
            </form>

            <script src="{$resources-url}/bootstrap/js/bootstrap.bundle.min.js?v={$version}"></script>
        </body>
    </xsl:template>

    <xsl:template name="hidden-fields">
        <input type="hidden" class="ewt-hidden-field" name="EWT:SESSIONID" id="ewt_sessionid" value="{/output/session/@id}"/>
        <input type="hidden" class="ewt-hidden-field" name="EWT:COMMAND" id="ewt_command" value=""/>
    </xsl:template>

    <xsl:template name="html-head-custom"/>
    <xsl:template name="html-body-custom"/>
    <xsl:template name="html-foot-custom"/>

    <xsl:template name="build-js-settings">
        <script type="text/javascript">
            const appSettings = {
                  resourcesUrl: "<xsl:value-of select="$resources-url"/>",
                  application: "<xsl:value-of select="/output/application/name/@dir"/>",
                  session: "<xsl:value-of select="/output/session/@id"/>",
                  context: [ <xsl:for-each select="/output/documents/document"><xsl:if test="position() &gt; 1">,</xsl:if>"<xsl:value-of select="@context"/>"</xsl:for-each>],
                  locale: "<xsl:value-of select="/output/session/@locale"/>",
                  style: "<xsl:value-of select="/output/session/@style"/>",
                  subject: "<xsl:value-of select="/output/subject/@login"/>",
                  contextPath: "<xsl:value-of select="/output/session/request/contextPath"/>",
                  numDocs: <xsl:value-of select="count(/output/documents/document)"/>,
                  fieldPrefix: "<xsl:value-of select="/output/session/fieldPrefix"/>",
                  sessionEOL: <xsl:value-of select="/output/session/@eol"/>,
                  sessionTTL: <xsl:value-of select="/output/session/@ttl"/>
            };
        </script>
    </xsl:template>
</xsl:stylesheet>