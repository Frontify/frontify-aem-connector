(function ($, document, Coral) {

    'use strict';


    $(document).on("click", ".cq-dialog-submit", function(e) {
        function replaceInputName(propertyName) {
            var inputElement = $("input[type='hidden'][name='" + propertyName +"']");
            if (inputElement) {
                var fileReferenceInput = inputElement.siblings("input[data-cq-fileupload-parameter='filereference']");
                if (fileReferenceInput) {
                    var fileReferenceNameAttribute = fileReferenceInput.attr('name');
                    if (fileReferenceNameAttribute) {
                        var fileReferencePath = fileReferenceInput.attr('name').replace("./fileReference", "");
                        inputElement.attr("name", fileReferencePath + propertyName);
                    }
                }
            }
        }
        var properties = ['./title','./alt', './width', './height', './focalPoint'];

        properties.forEach(property => replaceInputName(property));

    });

})(jQuery, document, Coral);