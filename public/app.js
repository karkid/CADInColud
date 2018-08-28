var DXFParser = require('../lib_build/parsers/DXFParser');
var progress = document.getElementById('file-progress-bar');
var $progress = $('.progress');

var $cadview = $('#cad-view');
var cadCanvas;

// Setup the dnd listeners.
var dropZone = $('.drop-zone');
dropZone.on('dragover', handleDragOver, false);
dropZone.on('drop', onFileSelected, false);

document.getElementById('dxf').addEventListener('change', onFileSelected, false);


function onFileSelected(evt) {
    progress.style.width = '0%';
    progress.textContent = '0%';

    var file = evt.target.files[0];
    document.getElementById('fileInfo').setAttribute("data-content", '<div> <b>File Name :</b> ' + file.name + '</div><br>' +
        '<div><b>Size :</b> ' + file.size + ' bytes</div><br>' +
        '<div><b>Last modified : </b>' + file.lastModifiedDate.toLocaleDateString() + '</div>');

    $progress.addClass('loading');

    var reader = new FileReader();
    reader.onprogress = updateProgress;
    reader.onloadend = onSuccess;
    reader.onabort = abortUpload;
    reader.onerror = errorHandler;
    reader.readAsText(file);
}

function abortUpload() {
    console.log('Aborted read!')
}

function errorHandler(evt) {
    switch (evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
        case evt.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
        case evt.target.error.ABORT_ERR:
            break; // noop
        default:
            alert('An error occurred reading this file.');
    }
}

function updateProgress(evt) {
    console.log('progress');
    console.log(Math.round((evt.loaded / evt.total) * 100));
    if (evt.lengthComputable) {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        if (percentLoaded < 100) {
            progress.style.width = percentLoaded + '%';
            progress.textContent = percentLoaded + '%';
        }
    }
}

function onSuccess(evt) {
    var fileReader = evt.target;
    if (fileReader.error) return console.log("error onloadend!?");
    progress.style.width = '100%';
    progress.textContent = '100%';
    setTimeout(function () {
        $progress.removeClass('loading');
    }, 2000);
    var parser = new DXFParser.default();
    var dxf = parser.parse(fileReader.result);

    // Three.js changed the way fonts are loaded, and now we need to use FontLoader to load a font
    //  and enable TextGeometry. See this example http://threejs.org/examples/?q=text#webgl_geometry_text
    //  and this discussion https://github.com/mrdoob/three.js/issues/7398 
    var font;
    var loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', function (response) {
        font = response;
        cadCanvas = new ThreeDxf.Viewer(dxf, document.getElementById('cad-view'), $('body').width(), $('body').height(), font);
    });

}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
// Newly Added
window.onresize = () => {
    cadCanvas.resize($('body').width(), $('body').height());
}

$('[data-toggle="popover"]').popover({ html: true });
document.getElementById('open').onclick = function () {
    document.getElementById('dxf').click();
};

document.getElementById('zoom_in').onclick = function () {

};
document.getElementById('zoom_out').onclick = function () {

};
document.getElementById('zoom_reset').onclick = function () {

};
document.getElementById('pan_home').onclick = function () {
};