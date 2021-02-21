/**
 * Theme: Uplon Admin Template
 * Author: Coderthemes
 * Tree view
 */

function makeAddCabButtonClickable(addCabButton){
	$(addCabButton).click(function(event){
		event.preventDefault();
		var globalID = $(this).data('globalId');
		var globalIDArray = globalID.split('-');
		var cabinetID = globalIDArray[2];
		addCab(cabinetID, 0, 'object');
	});
}

function addCab(elementID, elementFace, elementType){
	
	// Prevent duplicate cabinets from being added
	if($('#diagramCabinetContainer'+elementID).length && elementType == 'cabinet') {
		return false;
	}
	
	//Collect object data
	var data = {
		cabinetArray: [{
			id: elementID,
			face: elementFace,
			type: elementType
		}],
		view: 'port',
		page: 'diagram'
	};
	data = JSON.stringify(data);
	
	//Retrieve object details
	$.post("backend/create_build_space.php", {data:data}, function(responseJSON){
		var response = JSON.parse(responseJSON);
		if (response.active == 'inactive'){
			window.location.replace("/");
		} else if ($(response.error).size() > 0){
			displayError(response.error);
		} else {
			$.each(response.data, function(dataIndex, cabinet){
				$.each(cabinet.ancestorIDArray, function(cabinetIndex, ancestor){
					var locationID = ancestor.id;
					var locationName = ancestor.name;
					var parentID = ancestor.parentID;
					if(parentID == '#') {
						parentDOM = $('#buildSpaceContent');
					} else {
						parentDOM = $('#locationBox'+parentID);
					}
					if(!$('#locationBox'+locationID).length) {
						var locationBoxHTML = '<div id="locationBox'+locationID+'" class="diagramLocationBox"><div class="diagramLocationBoxTitle">'+locationName+'</div><div class="diagramLocationSubBox"></div></div>';
						$(parentDOM).append(locationBoxHTML);
					}
				});
				var cabinetLocationID = cabinet.locationID;
				$('#locationBox'+cabinetLocationID).children('.diagramLocationSubBox').first().append('<div id="diagramCabinetContainer'+elementID+'" class="diagramCabinetContainer">'+cabinet.html+'</div>');
			});
			
			if(elementType == 'object') {
				drawCabinet();
			}
			
			makePortsHoverable(false);
			makeCabArrowsClickable();
			makeCabCloseClickable();
			$('#objectTreeModal').modal('hide');
		}
	});
}

$( document ).ready(function() {
	
	initializeCanvas();
	
	$('#btnAddCabinet').click(function(e){
		e.preventDefault();
		$('#objectTreeModal').modal('show');
	});
	
	$('#buttonObjectTreeModalSave').click(function(){
		var node = $('#objTree').jstree('get_selected', false);
		var nodeID = node[0];
		
		addCab(nodeID, 0, 'cabinet');
	});
	
		// Ajax Tree
	$('#objTree')
	.jstree({
		'core' : {
			'multiple': false,
			'themes': {
				'responsive': false
			},
			'data' : {
				'url' : function (node) {
					return 'backend/retrieve_environment-tree.php?scope=cabinet';
				}
			}
		},
		'state' : {
			'key' : 'diagramNavigation'
		},
		"types" : {
			'default' : {
				'icon' : 'fa fa-building'
			},
			'location' : {
				'icon' : 'fa fa-building'
			},
			'pod' : {
				'icon' : 'zmdi zmdi-group-work'
			},
			'cabinet' : {
				'icon' : 'fa fa-server'
			},
			'object' : {
				'icon' : 'fa fa-minus'
			},
			'port' : {
				'icon' : 'fa fa-circle'
			},
			'floorplan' : {
				'icon' : 'fa fa-map-o'
			}
        },
		"plugins" : [ "search", "state", "types", "wholerow" ]
    });
});