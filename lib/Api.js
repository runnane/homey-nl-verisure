'use strict';

const Homey = require('homey');
var request = require('request');
var xml2js = require('xml2js');

const BASE_HOST = 'e-api01.verisure.com';
const BASE_URL = 'https://e-api01.verisure.com/xbn/2';
const timer = ms => new Promise( res => setTimeout(res, ms));

class VerisureApi {
	
	delay () {
		
		timer(3000).then(_=>console.log("done"));
		
	  }
	sendRequest ( options ) {
		'use strict';
		return new Promise( function ( resolve, reject ) {
			request( options, function requestCallback( error, response, body ) {
				// handle response errors
				if (error) {
					reject(response);
				} else if (!(/^2/.test('' + response.statusCode))) { // Status Codes other than 2xx
					reject(error);
				} else if (options.json && !response.headers) {
					reject('no headers found. request failed');
				} else if (options.json && response.headers['content-type'] !== 'application/json;charset=UTF-8') {
					reject('Expected JSON, but got html');
				}
	
				// resolve / reject
				if ( error ) {
					reject( error );
				} else {
					
					resolve( body );
				}
			});
		});
	}
	
	authenticate() {

		

		if (Homey.ManagerSettings.get('username') != null) {      
			

			var userid = Homey.ManagerSettings.get('username');
			var password = Homey.ManagerSettings.get('password');

			var cred = Buffer.from("CPE/" + userid + ":" + password).toString('base64');

			var opt = {
				port: 443,
				url: BASE_URL + '/cookie',
				method: 'POST',
				headers: {
					'Host' : 'e-api01.verisure.com',
				  	'Content-Type': 'application/xml;charset=UTF-8',
				  	'Authorization' : 'Basic ' + cred
				}
			  };
			  
			  this.sendRequest(opt).then( this.parseApiResponse).then( this.setToken).catch(this.logger);
			  
		 }
		 else {
			 console.log('no user cred');
		 }
	}
	
	
	parseApiResponse(input) {

		return new Promise( function ( resolve, reject ) {
			var parser = new xml2js.Parser();
			var res = parser.parseString(input, function (err, result) {
				console.log(result);
				resolve(result);
				
			});
		});
	}
	
	setToken(input) {
		
		var token = input["response"]['createCookieResponse'][0]['cookie'][0]
		Homey.ManagerSettings.set('token', token);
		this.getOverview();
		
	}
	getToken( ) {
		
		if( Homey.ManagerSettings.get('token') === null ) {
			console.log('no token found, new one requesting');
			this.authenticate();
		}
		else {
			this.getOverview();
			return Homey.ManagerSettings.get('token');
		}
		
	}
	
	getInstallation(id) {

		var options = {
			port: 443,
			url: BASE_URL + '/installation/'+ Homey.ManagerSettings.get('giid')  +'/',
			method: 'GET',
			headers: {
                'Host': BASE_HOST,
			    'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };

		  this.sendRequest(options).then(this.parseApiResponse).then(function ( input ) {
				//console.log(input["response"]);
			
			});

	}
	
	getDoorWindow() {
		var options = {
			port: 443,
			url: BASE_URL + '/installation/'+ Homey.ManagerSettings.get('giid')  +'/device/view/DOORWINDOW/',
			method: 'GET',
			headers: {
                'Host': BASE_HOST,
			    'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };

		  this.sendRequest(options).then(this.parseApiResponse).then(this.setDoorWindow);
	}
	setDoorWindow(data) {
				
		Homey.ManagerSettings.set('doorWindow', data["response"]["devices"][0]["doorWindowDevice"]);
		
		
	}
    getInstallations() {

		var options = {
			port: 443,
			url: BASE_URL + '/installation/search?email=' + Homey.ManagerSettings.get('username'),
			method: 'GET',
			headers: {
                'Host': BASE_HOST,
			    'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };
		  
		  this.sendRequest(options).then(this.parseApiResponse).then(this.setInstallationKey);
    }
    
    setInstallationKey(input) {
	    
		Homey.ManagerSettings.set('giid', input["response"]['installation'][0]['giid'][0]);
		Homey.ManagerSettings.set('alarm_name', input["response"]['installation'][0]['street'][0]);
		Homey.ManagerSettings.set('alarm_houseno', input["response"]['installation'][0]['streetNo1'][0]);
		
	 	
    }
    
    getArmState() {
	    
			var options = {
				port: 443,
				url: BASE_URL + '/installation/' + Homey.ManagerSettings.get('giid') + '/armstate',
				method: 'GET',
				headers: {
					'Host': BASE_HOST,
					'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
				  
				}
			  };
			 
				this.sendRequest(options).then(this.parseApiResponse).then(function ( input ) {
					
						Homey.ManagerSettings.set('armstate', input["response"]["installationStatus"][0]["statusType"][0]);
						return Homey.ManagerSettings.get('armstate'); 
						
			});
			
		    return Homey.ManagerSettings.get('armstate');  
	}
	
	
    
    getOverview() {
		
		if(Homey.ManagerSettings.get('giid') != null) {

		
		var options = {
			port: 443,
			url: BASE_URL + '/installation/' + Homey.ManagerSettings.get('giid') + '/overview',
			method: 'GET',
			headers: {
				'Host': BASE_HOST,
				'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };

		  this.sendRequest(options).then(this.parseApiResponse).then(this.setDevices);
		}
	}
	setDevices(data) {

		Homey.ManagerSettings.set('climateStatus', data["response"]["installationOverview"][0].climateValues[0]); 
		
	}
    respond(value) {
	    return value;
    }
    
    logger ( data ) {
		
		console.log( data );
	}


}
	
module.exports = VerisureApi