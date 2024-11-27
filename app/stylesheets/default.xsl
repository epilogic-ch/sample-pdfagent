<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:import href="base.xsl"/>
    
    <xsl:key name="labels-default" match="/output/bundles/bundle[@name='default']/label" use="@key"/>

    <xsl:template name="html-head-custom">
        <link rel="stylesheet" href="{$resources-url}/css/styles.css?v={$version}"/>
        <script type="text/javascript" src="{$resources-url}/js/filedrop.js?v={$version}"></script>
        <link rel="stylesheet" href="{$resources-url}/css/filedrop.css?v={$version}"/>

        <style type="text/css">
            .btn {
                margin: .25rem .125rem;
            }
            div + h4 {
                margin-top: 20px;
            }
        </style>
    </xsl:template>

    <xsl:template name="html-body-custom">
        <div id="form-body" class="container">
            <h1><xsl:value-of select="key('labels-default', 'title.main')"/></h1>
            <p><xsl:value-of select="key('labels-default', 'label.description')"/></p>

            <h4><xsl:value-of select="key('labels-default', 'title.step1')"/></h4>
            <input type="hidden" name="pageids" id="pageids"/>
            <div id="my-filedrop" class="fd-container">
                <div class="fd-drop-zone">
                    <input class="fd-drop-input" type="file" name="pdffile" id="pdffile" data-multiple-caption="[count] files selected" multiple="false" />
                    <label for="pdffile"></label>
                    <button class="fd-drop-upload-btn" type="button" onclick="filedrop.submit('#my-filedrop')"><xsl:value-of select="key('labels-default', 'label.loadpdf')"/></button>
                </div>
                <div class="fd-base-label"><xsl:value-of select="key('labels-default', 'label.selectFile')" disable-output-escaping="yes"/></div>
                <div class="fd-uploading"><xsl:value-of select="key('labels-default', 'label.uploading')"/></div>
                <div class="fd-success"><xsl:value-of select="key('labels-default', 'label.done')"/>&#160;<a href="javascript:void(0)" onclick="filedrop.reset('#my-filedrop')" class="fd-restart" role="button"><xsl:value-of select="key('labels-default', 'label.uploadmore')"/></a></div>
                <div class="fd-error"><xsl:value-of select="key('labels-default', 'label.error')"/>&#160;<a href="javascript:void(0)" onclick="filedrop.reset('#my-filedrop')" class="fd-restart" role="button"><xsl:value-of select="key('labels-default', 'label.tryagain')"/></a><span></span>.</div>
                <div class="fd-oversize"><xsl:value-of select="key('labels-default', 'label.toolarge')"/>&#160;<a href="javascript:void(0)" onclick="filedrop.reset('#my-filedrop')" class="fd-restart" role="button"><xsl:value-of select="key('labels-default', 'label.tryother')"/></a><span></span>.</div>
            </div>

            <h4><xsl:value-of select="key('labels-default', 'title.step2')"/></h4>
            <div class=" mt-3">
                <span ></span>
                <ul id="pdf-pages"></ul>
            </div>

            <h4><xsl:value-of select="key('labels-default', 'title.step3')"/></h4>
            <div class="mt-3">
                <!--<button type="button" class="btn btn-primary" onclick="loadDocument()">Load PDF</button>-->
                <button type="button" class="btn btn-success disabled" id="btnDownload" onclick="pdf.get()"><xsl:value-of select="key('labels-default', 'label.getpdf')"/></button>
                <!--<button type="button" class="btn btn-secondary" onclick="ewt.submit('reset')">Reset</button>-->
            </div>
            
        </div>


        <script type="text/javascript">
            function loadDocument() {
                document.getElementById('btnDownload').classList.add('disabled');
                var file = document.getElementById('pdffile').files[0];

                if (file) {
                    pdf.init(
                        "<xsl:value-of select="$resources-url"/>/js/pdfjs/build/pdf.worker.mjs",
                        function() {
                            document.getElementById('btnDownload').classList.remove('disabled');
                        });
                    pdf.load(file);
                    
                }
                else {
                    alert("<xsl:value-of select="key('labels-default', 'message.selectfile')"/>");
                }
            }

            filedrop.init({
                url: '<xsl:value-of select="/output/session/request/url"/>',
                selector: '#my-filedrop',
                extraFields: '.ewt-hidden-field',
                maxFilesize: 10485760,
                onSubmit: function(dropzone, formdata) {
                    loadDocument();
                    return false;
                }
            });
        </script>
    </xsl:template>

    <xsl:template name="html-foot-custom">
        <div id="form-footer" class="container">
            <p><a href="javascript:void(0)" onclick="document.querySelector('.disclaimer').style.display='block';"><xsl:value-of select="key('labels-default', 'label.usageconditions')"/></a></p>
            <div class="disclaimer" style="display:none">
                <xsl:value-of select="key('labels-default', 'disclaimer')" disable-output-escaping="yes"/>
                <a href="javascript:void(0)" onclick="document.querySelector('.disclaimer').style.display='none';"><xsl:value-of select="key('labels-default', 'label.igotit')"/></a>
            </div>
        </div>
    </xsl:template>
</xsl:stylesheet>