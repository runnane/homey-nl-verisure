'use strict';

const Homey = require('homey');
const Verisure = require('../../lib/Api.js');

class DoorWindow extends Homey.Device {

    logger ( data ) {
		
		console.log( data );
	}
	
    // this method is called when the Device is inited
    onInit() {
       
        const POLL_INTERVAL = 1000 * 60 * 0.5; // 30 minutes

        // first run
        this.pollSensorStatus();

        this._pollSensorInterval = setInterval(this.pollSensorStatus.bind(this), POLL_INTERVAL);
        

    }
    onSensorChange(value) {
        
        this.log('onSensorChange Window');
        
        if(value) {
            this.setCapabilityValue('alarm_contact', value);
        }

    }

    

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }
    pollSensorStatus() {

		if (Homey.ManagerSettings.get('username') != null) {      
            
           	this.log('[#63] Polling climate...');	
            var d = this.getName();
            
            let api = new Verisure();
            api.getDoorWindow();

            
            var data = Homey.ManagerSettings.get('doorWindow');
            
            var bla = this;
            
            data.forEach(function(entry) {
                
                
                if(entry["area"][0] && entry["area"][0] === d) {
                    
                    
					if(entry["state"][0] === "CLOSE") {
						var v = false;
						console.log(entry["area"][0] + ': true');
					}
					else {
						var v = true;
						console.log(entry["area"][0] + ': false');
					}
					
                    bla.onSensorChange(v);
                    
                }
            }); 

           
			return Promise.resolve();
			
		}
	}
	
}

module.exports = DoorWindow;