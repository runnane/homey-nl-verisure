'use strict';

const Homey = require('homey');
const Verisure = require('../../lib/Api.js');

class DoorWindow extends Homey.Device {

    logger ( data ) {
		
		console.log( data );
	}
	
    // this method is called when the Device is inited
    onInit() {
       
        const POLL_INTERVAL = 1000 * 60 * 1; // 30 minutes

        // first run
        this.pollSensorStatus();

        this._pollSensorInterval = setInterval(this.pollSensorStatus.bind(this), POLL_INTERVAL);
        

    }
    onSensorChange(value) {
        
        //this.log('onTempChange ');
        
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
            api.getOverview();

            
            var data = Homey.ManagerSettings.get('climateStatus');
            var res = data["latestClimateSample"];
            var bla = this;
            
            res.forEach(function(entry) {
                
                
                if(entry["deviceArea"][0] && entry["deviceArea"][0] === d) {
                    console.log(entry["deviceArea"][0] + ':' + entry["temperature"][0]);
                    
                    bla.onSensorChange(parseInt(entry["temperature"][0]));
                    
                }
            }); 

           
			return Promise.resolve();
			
		}
	}
	
}

module.exports = DoorWindow;