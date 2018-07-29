
# QR Party

## Let the dancefloor decide the line up!
 

QR Manager for Event and Party ; Real time vote QR code and Webcam.


Server side, you will need a unix server with node.js
Client side, any device with javascript, HTML5 and a webcam 
Admin interface and client can run on smartphone Android too.


## features

* The servers can host several parties in same times
* Work with old hardware
* Can run in localhost without any internet connection
* mobile friendly
    

## Hardware Requirement 

QR Party is designed to run on hardware easy to find.
No specific hardware is needed like a barcode.Some old laptop with a webcam are enough.


* A screen or projector screen 
* A terminal with a WebCam who can display an HTML5 page (PC, MAC, Mobile, Raspberry Pi)
* A printer


### 2018 Updated Edition

* Node.js v8
* Pug v2
* Bootstrap v4
* Jquery v3
* Express v4
* Font Awesome v5.2
* IntaScan v1



## How it's work 

 * Build a PartyTAG available over internet or in localhost
 * Print listing of unique QR code and spread them to your participants
 * They can vote over HTML5/Browser with webcam
 * Real time D3 graph for Vjay, big screen and projector
 * fun !


## Requirement 

    apt-get install qrencode


## Installation

    git clone git@github.com:jcnade/QRParty.git
    cd QRParty
    npm install
    node qr-server
    


## How to use it

Start the webserver on port 3000
     node qr-server 

You can build a PartyTag here
     http://<IP-of-your-server>:3000/admin

And connect some terminal with webcam there
     http://<IP-of-your-server>:3000/


## Beerware

This project is free (GPL) but if you like it or use for your own party, feel free
to invite me for a beer or something.
