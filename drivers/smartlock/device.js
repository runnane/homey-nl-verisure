'use strict';

const Homey = require('homey');
const Verisure = require('../../lib/Api.js');

class SmartLock extends Homey.Device {

    logger ( data ) {
		
		console.log( data );
	}
	
    // this method is called when the Device is inited
    onInit() {
       
        const POLL_INTERVAL = 5000; // 

        // first run
        this.pollSmartLockStatus();
         // register a capability listener
       // this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

        this._pollSmartLockInterval = setInterval(this.pollSmartLockStatus.bind(this), POLL_INTERVAL);
        

    }
    onLockChange(value) {
        
        if(value) {
            this.setCapabilityValue('locked', value);
            this.log('onLockChange SmartLock:' +value);
        } 
        
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device SmartLock added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        console.log("trigger on or off: " + value);

        if(Homey.ManagerSettings.get('keycode')) {
            let api = new Verisure();
            api.setLockState(value);
        }
        // Then, emit a callback ( err, result )
        Promise.resolve();

    }

    pollSmartLockStatus() {

		if (Homey.ManagerSettings.get('username') != null) {      
            
           	this.log('[#63] Polling SmartLock...');	
            var d = this.getName();
            
            let api = new Verisure();
            api.getSmartLock();

            
            var data = Homey.ManagerSettings.get('SmartLock');
            
            var bla = this;
            
			if(data != null) {
                data.forEach(function(entry) {
                
                
                    if(entry["area"][0] && entry["area"][0] === d) {
                        
                        console.log('SmartLock value: [' + entry["lockedState"][0] + ']');
                       
                        if(entry["lockedState"][0] === "LOCKED") {
                            var v = new Boolean(true);
                        }
                        else {
                            var v = new Boolean(false);
                        }
                        
                        bla.onLockChange(v);
                        
                    }
                }); 
            }
           
			return Promise.resolve();
			
		}
	}
	
}

module.exports = SmartLock;
