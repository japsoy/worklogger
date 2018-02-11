var markerPosition = {
    'lat': 0.0,
    'lng': 0.0
};


var map;
var shape;
var search_result_marker;
var marker = null;


function roundTo7(num) {
    return +(Math.round(num + "e+7")  + "e-7");
}

function create_marker(latlng) {
    marker = new google.maps.Marker({
        position: latlng,
        title: 'Drag this marker to reposition',
        map: map,
        draggable: true
    });
    markerPosition.lat = roundTo7(marker.position.lat());
    markerPosition.lng = roundTo7(marker.position.lng());
    // console.log(marker.position.lat());
    // console.log(marker.position.lng());
    // console.log(marker.getPosition());

    google.maps.event.addListener(marker, 'dragend', function(evt) {
        markerPosition.lat = roundTo7(evt.latLng.lat());
        markerPosition.lng = roundTo7(evt.latLng.lng());
    });
}

function delete_marker() {
    if ((marker != null) && marker.setMap) {
        marker.setMap(null);
        marker = null;
    }
}

function set_marker_to_center() {
    // map.setCenter(new google.maps.LatLng(markerPosition.lat, markerPosition.lng));
    map.panTo(marker.getPosition());
    map.setZoom(17);
}


$(document).ready(function() {
    //- featured checkbox
    var options = {
       zoom: 5,
       mapTypeId: google.maps.MapTypeId.ROADMAP,
       disableDoubleClickZoom: true,
       center: new google.maps.LatLng(11.9275524, 123.079834),
       scrollwheel: false
    };


	if (place['latitude'] != undefined) {
		options['center'] = new google.maps.LatLng(place['latitude'], place['longitude']);
	}
    map = new google.maps.Map(document.getElementById('map'), options);


    //-- Search Box
    //------------------------------------------------------------------------
	var input = (document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox((input));

	var options = {
		// componentRestrictions: {country: 'PH'}
	};
	var searchBox = new google.maps.places.Autocomplete(input, options);

	google.maps.event.addListener(searchBox, 'place_changed', function() {
		if (search_result_marker != undefined) {
			search_result_marker.setMap(null);
			search_result_marker = undefined;
		}
		var place = searchBox.getPlace();
	    if (!place.geometry) {
			return;
	    }

	    // search_result_marker = new google.maps.Marker({
		// 	position: place.geometry.location,
		// 	map: map,
		//     title: place.name,
		//     infoWindow: place.name,
		//     icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
		// });

		map.setCenter(place.geometry.location);
		if (place.geometry.viewport != undefined) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setZoom(17);
		}
	});
    //------------------------------------------------------------------------


	google.maps.event.addListener(map, 'dblclick', function(event) {
		map.setCenter(event.latLng)
		map.setZoom(map.getZoom() + 1);
	});


    google.maps.event.addListener(map, "rightclick",function(event){
        delete_marker();
        create_marker(event.latLng);
    });
});
