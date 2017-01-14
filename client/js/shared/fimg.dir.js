/**
 * Created by zoonman on 12/16/16.
 */
app.directive('file', [function() {


    function fImgTemplate(scope, element, attrs) {

        console.log('fImgTemplate', attrs)
        //
        function updateSrc(file) {
            var imageType = /^image\//;
            if (!imageType.test(file.type)) {
                return;
            }
           /* var reader = new FileReader();
            reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(element);
            reader.readAsDataURL(file);*/
            element[0].src = window.URL.createObjectURL(file)
            console.log('element', element)
            console.log('file', file)
        }

        scope.$watch(attrs.file, function(value) {
            console.log('scope', scope)
            updateSrc(scope.$parent.notification.file);
        });

        element.on('$destroy', function() {
            //$interval.cancel(timeoutId);
        });

    }


    return {
        link: fImgTemplate
    };
}]);
