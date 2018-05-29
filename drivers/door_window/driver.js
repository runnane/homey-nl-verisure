'use strict';

const Homey = require('homey');
const Verisure = require('../../lib/Api.js');


const deviceMap = new Map();
require('es6-promise').polyfill();

class DoorWindow extends Homey.Driver {

    _initDevice() {
        this.log('_initDevice');
       
    }

    onPairListDevices( data, callback ) {

        let api = new Verisure();
        api.getOverview();
        api.delay();
        
        var d = Homey.ManagerSettings.get('doorWindow');
        if(d != null) {
            
            console.log(d);
            console.log(d[0]);
            console.log(d["deviceLabel"]);
            console.log(d[0]["deviceLabel"]);
        }
    }

}

module.exports = DoorWindow;