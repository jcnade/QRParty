/*
 *  QR Party - Client Side Code
 *  ============================
 *
 *
 *  Dependency :
 *
 *  IntraScan for video QR decoding
 *  https://github.com/schmich/instascan
 *
 *  JQuery
 *
 */

// vidos1bMUu_A-uidHJwY3ycrE-2.png
function qrparty_vote(string) {

    var vote = string.split('|');

    console.log('qrparty_vote()', string)
    console.log('qrparty_vote()', vote)

    var vid   = vote[1];
    var uid   = vote[2];
    var value = vote[3];

    // Voting via the API
    $('/v1/vote/'+vid+'/'+uid+'/'+value, function(response){
        console.log('response',response)
    })

}


function start_camera(id) {


    let options = {
        // Whether to scan continuously for QR codes. If false, use scanner.scan() to manually scan.
        // If true, the scanner emits the "scan" event when a QR code is scanned. Default true.
        continuous: true,

        // The HTML element to use for the camera's video preview. Must be a <video> element.
        // When the camera is active, this element will have the "active" CSS class, otherwise,
        // it will have the "inactive" class. By default, an invisible element will be created to
        // host the video.
        video: document.getElementById(id),

        // Whether to horizontally mirror the video preview. This is helpful when trying to
        // scan a QR code with a user-facing camera. Default true.
        mirror: true,

        // Whether to include the scanned image data as part of the scan result. See the "scan" event
        // for image format details. Default false.
        captureImage: false,

        // Only applies to continuous mode. Whether to actively scan when the tab is not active.
        // When false, this reduces CPU usage when the tab is not active. Default true.
        backgroundScan: true,

        // Only applies to continuous mode. The period, in milliseconds, before the same QR code
        // will be recognized in succession. Default 5000 (5 seconds).
        refractoryPeriod: 5000,

        // Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
        // increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
        scanPeriod: 1
    };

    let scanner = new Instascan.Scanner(options);

    scanner.addListener('scan', function (content) {
        console.log("decoding", content);
        qrparty_vote(content)
    });

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    });

}