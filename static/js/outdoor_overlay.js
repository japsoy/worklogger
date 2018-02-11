
function getTotalArea(shape) {
	if (shape.type == 'polygon') {
		return google.maps.geometry.spherical.computeArea(shape.getPath());
	} else if (shape.type == 'circle') {
		return shape.radius*shape.radius*Math.PI;
	}
}

/*function isShapeModified(shape) {
	var totalArea = getTotalArea(shape);
	if (shape.type == 'polygon') {
		if (totalArea != shape.initialTotalArea) return true;
	} else if (shape.type == 'circle') {
		if ((shape.intialRadius != shape.radius) || (shape.initialCenter != shape.center)) return true;
	}
	return false;
}*/

google.maps.Polygon.prototype.my_getBounds=function(){
    var bounds = new google.maps.LatLngBounds();
    this.getPath().forEach(function(element,index){bounds.extend(element)});
    return bounds;
}

LocationOverlay.prototype = new google.maps.OverlayView();

/** @constructor */
function LocationOverlay(shape, map) {
	this.shape = shape;

	var location = shape.location;
	var target = location.target;
	var premium_location_merchant = false

	var label;
	if (shape.editable) {
		label = '<div class="gmap-label gmap-label-active">'
	} else {
		label = '<div class="gmap-label">';
	}

	label += '<div class="gmap-title"><a href="/'+shape.url_page+'/' + location['_id'] + '" data-toggle="modal" data-target="#location-editor" class="gmap-label-edit gmap-label-edit-pos"><i class="fa fa-pencil"></i></a> <span id="spnBox_'+location['_id']+'">' + location['name'] + '</span></div>';

	var area_style = 'color:#fefefe;'
	//if (this.shape.type == 'polygon') {
	//	totalArea = google.maps.geometry.spherical.computeArea(shape.getPath());
	//} else if (this.shape.type == 'circle') {
	//	totalArea = shape.radius * shape.radius * Math.PI;
	//}
	var totalArea = getTotalArea(shape);

	if (totalArea > totalAreaLimit) {
		var area_style = 'color:#f00;'
	}

	if (this.shape.type == 'polygon') {
		label += '<hr>' +
				 '<div class="gmap-description" style="' + area_style + '">Area: ' + round_to_place(totalArea, 2) + ' meters</div>';
	} else if (this.shape.type == 'circle') {
		label += '<hr>' +
				 '<div class="gmap-description">Range: ' + round_to_place(shape.radius, 2) + ' meters</div>' +
				 '<div class="gmap-description" style="' + area_style + '">Area: ' + round_to_place(totalArea, 2) + ' meters</div>';
	}

	if (shape.editable) {
		if (shape.edited && !(totalArea > totalAreaLimit)) {
			label += '<input type="button" class="btn btn-success btn-xs" id="save-position-button" value="Save"/>&nbsp;';
		}
		label += '<input type="button" class="btn btn-danger btn-xs" id="cancel-position-button" value="Cancel"/>'
	}

	label += '</div>';

	this.html_ = label;
	this.map_ = map;
	this.div_ = null;
	this.setMap(map);
}

LocationOverlay.prototype.onAdd = function() {
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	div.innerHTML = this.html_;
	this.div_ = div;

	var panes = this.getPanes();
	//panes.overlayLayer.appendChild(div);
	panes.floatPane.appendChild(div);

};

LocationOverlay.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var div = this.div_;

	if (this.shape.type == 'polygon') {
		bounds_ = this.shape.my_getBounds();
		var center = overlayProjection.fromLatLngToDivPixel(bounds_.getCenter());
		var ne = overlayProjection.fromLatLngToDivPixel(bounds_.getNorthEast());

		var left = ne.x;
		var top = (center.y - ($(div).height())/2);
		div.style.left = left + 'px';
		div.style.top = top + 'px';
	} else if (this.shape.type == 'circle') {
		var center = overlayProjection.fromLatLngToDivPixel(this.shape.center);
		div.style.left = center.x + 'px';
		div.style.top = center.y + 'px';
	}
	div.style.zIndex = 295;

	$('#save-position-button').off('click');
	$('#save-position-button').click(function(ev) {
		// console.debug('save click', ev);
		ev.preventDefault();
		saveShape();
	});

	$('#cancel-position-button').off('click');
	$('#cancel-position-button').click(function(ev) {
		// console.debug('cancel click', ev);
		ev.preventDefault();
		cancelShape();
	});

};

LocationOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};



NewLocationOverlay.prototype = new google.maps.OverlayView();

/** @constructor */
function NewLocationOverlay(shape, map) {
	this.shape = shape;

	//var totalArea;

	var area_style = 'color:#fefefe;'
	label = '<div class="gmap-label gmap-label-active">';
	/*if (this.shape.type == 'polygon') {
		totalArea = google.maps.geometry.spherical.computeArea(shape.getPath());
	} else if (this.shape.type == 'circle') {
		totalArea = shape.radius * shape.radius * Math.PI;
	}*/
	var totalArea = getTotalArea(shape);

	label += '<div class="gmap-title">New Location</div><input type="button" class="btn btn-success btn-xs" onclick="showNewLocationModal();" value="Create this Location"';
	if (totalArea > totalAreaLimit) {
		var area_style = 'color:#f00;'
		label += ' disabled';
	}
	label += '/>&nbsp;<input type="button" class="btn btn-danger btn-xs" onclick="clearNewLocation();" value="Cancel"/>';

	if (this.shape.type == 'polygon') {
		label += '<hr>' +
				 '<div class="gmap-description" style="' + area_style + '">Area: ' + round_to_place(totalArea, 2) + ' meters</div>' +
				 '</div>';
	} else if (this.shape.type == 'circle') {
		label += '<hr>' +
				 '<div class="gmap-description">Range: ' + round_to_place(shape.radius, 2) + ' meters</div>' +
				 '<div class="gmap-description" style="' + area_style + '">Area: ' + round_to_place(totalArea, 2) + ' meters</div>' +
				 '</div>';
	}


	this.html_ = label;
	this.map_ = map;
	this.div_ = null;
	this.setMap(map);
}

NewLocationOverlay.prototype.onAdd = function() {
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	div.innerHTML = this.html_;
	this.div_ = div;

	var panes = this.getPanes();
	//panes.overlayLayer.appendChild(div);
	panes.floatPane.appendChild(div);

};

NewLocationOverlay.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var div = this.div_;

	if (this.shape.type == 'polygon') {
		bounds_ = this.shape.my_getBounds();
		var center = overlayProjection.fromLatLngToDivPixel(bounds_.getCenter());
		var ne = overlayProjection.fromLatLngToDivPixel(bounds_.getNorthEast());

		var left = ne.x;
		var top = (center.y - ($(div).height())/2);
		div.style.left = left + 'px';
		div.style.top = top + 'px';
	} else if (this.shape.type == 'circle') {
		var center = overlayProjection.fromLatLngToDivPixel(this.shape.center);
		div.style.left = center.x + 'px';
		div.style.top = center.y + 'px';
	}
	div.style.zIndex = 295;
};

NewLocationOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};
