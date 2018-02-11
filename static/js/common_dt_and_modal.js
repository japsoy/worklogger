var jqry_dTbl;

$(function() {
    //-- SETUP NEEDED:
    //------------------------------------
    // var tblRecords_load_url = "";
    // var tblRecords_delete_url = "";
    // var tblRecords_columns = [
    //     {
    //         'data': 'name',
    //         'sClass': 'td_name',
    //     },
    //     {
    //         'data': '_id',
    //         'orderable': false,
    //         'sClass': 'action_btns',
    //         'render': function (data, type, row) {
    //             return '<input type="hidden" name="id" value="'+ data +'"> ' +
    //                 '<button type="button" class="btn btn-primary btn-xs btn_edit"><i class="fa fa-pencil"></i> Edit</button> ' +
    //                 '<button type="button" class="btn btn-danger btn-xs btn_delete"><i class="fa fa-trash-o"></i> Delete</button>';
    //         }
    //     },
    //     //-- hidden columns goes here
    //     {'data': 'manager', 'sClass': 'td_manager hide'},
    //     {'data': 'email', 'sClass': 'td_email hide'},
    // ];
    // var tblRecords_sort = [[ 0, "asc" ]];
    // var entryModal_rules = {
    //     name: {
    //         minlength: 2
    //     }
    //  };
    // //- Populate Modal Fields
    // function populate_modal_fields($jo_entryModal, $tr) {
    //     $jo_entryModal.find('select[name="category"]').val($tr.find('td.td_category').html());
    // }
    //------------------------------------

    //-- OPTIONAL VARIABLES
    // var entryModal_newTitle_fixed = 'New Entry';
    // var entryModal_editTitle_fixed = 'Update Entry';
    // var entryModal_editTitle_source = 'td.td_name';
    // var entryModal_editSubTitle_fixed = '(Modify Entry)';
    //------------------------------------


    //-- PREFIX LEGEND:
    //------------------------------------
    // '$jo_' (jquery object)
    // 'jf_' (jquery function)
    // 'jv_' (jquery variable)
    //------------------------------------

    var csrftoken = getCookie('csrftoken');

    //- Jquery DataTables
    var $jo_tblRecords = $('#jo_tblRecords');
    var $jo_sel_search_tblRecords = $("#jo_sel_search_tblRecords"); //- dropdownlist/select field
    var $jo_sel_search_tblRecords2 = $("#jo_sel_search_tblRecords2"); //- dropdownlist/select field
    var $jo_sel_search_tblRecords3 = $("#jo_sel_search_tblRecords3"); //- dropdownlist/select field
    var $jo_sel_search_tblRecords4 = $("#jo_sel_search_tblRecords4"); //- dropdownlist/select field
    var $jo_txt_search_tblRecords = $("#jo_txt_search_tblRecords"); //- textbox
    var $jo_btn_search_tblRecords = $("#jo_btn_search_tblRecords"); //- button
    var $jo_btn_refresh_tblRecords = $("#jo_btn_refresh_tblRecords");
    var $jo_tblRecords_loader = $("#jo_tblRecords_loader");
    var $btn_delete_selected = $("#btn_delete_selected");
    var $cb_select_all = $("#cb_select_all");

    //- For Modals (Add/Edit)
    var $jo_entryModal = $('#jo_entryModal');
    var $jo_btn_add_to_entryModal = $('#jo_btn_add_to_entryModal');
    var $jo_entryModal_title =  $('#jo_entryModal_title');
    var $jo_entryModal_subtitle =  $('#jo_entryModal_subtitle');
    var $jo_entryModal_form = $('#jo_entryModal_form');
    //------------------------------------

    var bool_has_modal_change = false;
    var is_load_details_on_left = (typeof load_details_on_left !== "undefined");
    var no_data_string = (typeof load_no_data_string !== "undefined");
    var is_disable_auto_add_on_blank = (typeof disable_auto_add_on_blank !== "undefined");
    var selected_row_id = '';
    var $div_sel_detail = $('#div_sel_detail');
    var selected_ids = [];

    var jv_custom_filter = '';
    if (typeof dt_custom_filter !== "undefined") {
        jv_custom_filter = dt_custom_filter;
    }

    if (typeof load_no_data_string !== "undefined"){
        var no_data_string = load_no_data_string.substring(0, load_no_data_string.length - 1);
    } else {
        var no_data_string = "data";
    }

    if (typeof sDom !== "undefined"){
        var sDomVal = sDom;
    } else {
        var sDomVal = '<"clear">rt<"tmp-jqdt-bottom"lpi>';
    }

    var cookie_vars = $.cookie();
    if (cookie_vars['from_another_page'] === 'true') {
        $jo_txt_search_tblRecords.val(cookie_vars['from_another_page_username']);
        $.cookie('from_another_page', 'false');
        $.cookie('search_val', cookie_vars['from_another_page_username']);
    }

    if (cookie_vars['from_modem_usage'] === 'true') {
        $jo_txt_search_tblRecords.val(cookie_vars['from_modem_usage_nasidentifier']);
        $.cookie('from_modem_usage', 'false');
        $.cookie('search_val', cookie_vars['from_modem_usage_nasidentifier']);
    }

    if (cookie_vars['from_yubikey_page'] === 'true') {
        $jo_txt_search_tblRecords.val(cookie_vars['from_yubikey_username']);
        $.cookie('from_yubikey_page', 'false');
        $.cookie('search_val', cookie_vars['from_yubikey_username']);
    }

    $jo_btn_add_to_entryModal.prop("disabled", true);
    $.fn.dataTable.ext.errMode = 'none';

    //- Datatable Records
    //------------------------------------
    var onload_dt = false;
    jqry_dTbl = $jo_tblRecords.DataTable({
        'dom': sDomVal,
        "autoWidth": false,
        'responsive': true,
        'serverSide': true,
        'stateSave': true,
        "language": {
            // "info": "_START_ - _END_ of _TOTAL_ records",
            "emptyTable": "No "+ no_data_string +" available in table"
        },
        'ajax': {
            url: tblRecords_load_url,
            type: 'POST',
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            data: function(d) {
                d.selected_ids = selected_ids,
                d.txt_search_val = $jo_txt_search_tblRecords.val(),
                d.sel_search_val = $jo_sel_search_tblRecords.val(),
                d.sel_search_val2 = $jo_sel_search_tblRecords2.val(),
                d.sel_search_val3 = $jo_sel_search_tblRecords3.val(),
                d.sel_search_val4 = $jo_sel_search_tblRecords4.val(),
                d.custom_filter = jv_custom_filter
	        }
        },
        'order': tblRecords_sort,
        'columns': tblRecords_columns,
        'fnDrawCallback': function( oSettings ) {
            var redraw_dt;
            btn_loader($jo_btn_refresh_tblRecords, false, 'Reset Filter');
            if (is_load_details_on_left) {
                exec_on_dt_load();
            }
            redraw_dt = datatableDrawBack();
            move_bottom_elements();
            if (redraw_dt) {
                setTimeout(function() {
                    jqry_dTbl.draw();
                }, 100);
            }
        }
        ,'fnRowCallback': function(nRow, aData, iDisplayIndex) {
            nRow.setAttribute('id', aData['_id']);
        }
    });
    jqry_dTbl
        .on('init.dt', function(ev) {
            setTimeout(function() {
                $('#table-row').removeClass('hidden');
            }, 100);
        })
        .on('preXhr.dt', function() {
            toggle_datatable_loader(true);
        })
        .on('xhr.dt', function() {
            toggle_datatable_loader(false);
        });

    // Search Operation
    $jo_txt_search_tblRecords.keypress(function(e) {
        if(e.which == 13) { $jo_btn_search_tblRecords.click(); }
    });
    $jo_btn_search_tblRecords.click(function(){
        jqry_dTbl.draw(); //-- reload the datatable
    });
    // Select search operation
    $('#jo_sel_search_tblRecords, #jo_sel_search_tblRecords2, #jo_sel_search_tblRecords3, #jo_sel_search_tblRecords4').change(function(event) {
        jqry_dTbl.draw(); //-- reload the datatable
    });
    //- Refresh
    $jo_btn_refresh_tblRecords.click(function () {
        $('#jo_txt_search_tblRecords, #jo_sel_search_tblRecords, #jo_sel_search_tblRecords2, #jo_sel_search_tblRecords3, #jo_sel_search_tblRecords4').val('');
        btn_loader($(this), true)
        jqry_dTbl.draw(); //-- reload the datatable
    });

    // Edit button
    $jo_tblRecords.on('click', 'tr', function(ev) {
        if (typeof ev.target.type !== 'undefined') { //-- if from cbx clicked event, skip this event
            return;
    	}
        $(this).find('button.btn_edit').click();
        var id = $(this).find('input[name="id"]').val();
        if (typeof id !== "undefined") {
            selected_row_id = id;
            $.cookie('selected_row_id', id);
            highlight_selected_row();
            if (is_load_details_on_left) {
                exec_record_detail(right_side_url, id);
            }
        }
    });

    $jo_tblRecords.on('click', 'button.btn_edit', function(ev) {
        ev.stopPropagation();
        $jo_entryModal.modal('show');
        var $tr = $(this).parents('tr');
        //- title
        if (typeof entryModal_editTitle_fixed !== "undefined")
            $jo_entryModal_title.html(entryModal_editTitle_fixed);
        else if (typeof entryModal_editTitle_source !== "undefined")
            $jo_entryModal_title.html($tr.find(entryModal_editTitle_source).html());
        else
            $jo_entryModal_title.html('Edit Entry');
        //- subtitle
        if (typeof entryModal_editSubTitle_fixed !== "undefined")
            $jo_entryModal_subtitle.html(entryModal_editSubTitle_fixed);
        var id = $tr.find('input[name="id"]').val();
        $jo_entryModal.find('input[name="id"]').val(id);
        $jo_entryModal.find('input[name="name"]').val($tr.find('td.td_name').html());

        try {
            populate_modal_fields($jo_entryModal, $tr);
        } catch(err) {}
    });

    $btn_delete_selected.hide();
    //-select
    $jo_tblRecords.on('change', 'input:checkbox[name="cb_select_row"]', function(ev) {
        if ($(this).is(':checked')) {
            selected_ids.push($(this).val());
        }
        else {
            for (var i = 0; i < selected_ids.length; i++) {
               if (selected_ids[i] == $(this).val()) {
                   selected_ids.splice(i, 1);
                   break;
               }
            }
        }

        if (selected_ids.length == 0 || $jo_tblRecords.find('td.dataTables_empty').length > 0) {
            $btn_delete_selected.hide();
            $btn_delete_selected.prop('disabled', true);
        } else {
            $btn_delete_selected.show();
            $btn_delete_selected.prop('disabled', false);
        }
	});
    //select all
    $cb_select_all.click(function() {
        if($(this).is(':checked')){
            selected_ids = [];
            $("input[name=cb_select_row]").prop('checked', true).trigger("change");
        } else {
            $("input[name=cb_select_row]").prop('checked', false).trigger("change");
        }
    });
    // Delete selected
    $btn_delete_selected.click(function() {
        swal_confirm('Delete selected record(s)?', "" , function() {
            ajax_post_with_csrf_token(tblRecords_deleteAll_url, {selected_ids: selected_ids}, csrftoken, 'Records Deleted', function(resp) {
                $btn_delete_selected.hide();
                $btn_delete_selected.prop('disabled', true);
                jqry_dTbl.draw(false);
            }, function() {});
        }, true);
    });

    // Delete button
    $jo_tblRecords.on('click', 'button.btn_delete', function(ev) {
            ev.stopPropagation();
            var $tr = $(this).parents('tr');
            var id = $tr.find('input[name="id"]').val();
            var item_desc = $tr.find('.bold_link').first().html();
            if (typeof item_desc === "undefined")
                item_desc = $tr.find('td').first().html();
            swal_confirm('Delete this record?', item_desc, function() {
                ajax_post_with_csrf_token(tblRecords_delete_url, {_id: id}, csrftoken, 'Record Deleted', function(resp) {
                    $div_sel_detail.addClass('hide');
                    jqry_dTbl.draw(false);
                    try {
                        post_delete_process(resp);
                    } catch(err) {}
                }, function() {});
            }, true);
    });
    // Delete button
    $jo_tblRecords.on('mouseover', 'tr.odd, tr.even', function(ev) {
        $(this).find('td.action_btns').find('button.btn').css('visibility', 'visible');
    });
    $jo_tblRecords.on('mouseout', 'tr.odd, tr.even', function(ev) {
        $(this).find('td.action_btns').find('button.btn').css('visibility', 'hidden');
    });
    //------------------------------------


    //- Modal Add/Edit
    //------------------------------------

    // - Tab key not working after opening two Sweet Alert Modals in a row
    var _swal = window.swal;
    window.swal = function(){
        var previousWindowKeyDown = window.onkeydown;
        _swal.apply(this, Array.prototype.slice.call(arguments, 0));
        window.onkeydown = previousWindowKeyDown;
    };

    // New entry
    $('#jo_btn_add_to_entryModal').click(function(event) {
        if (typeof entryModal_newTitle_fixed !== "undefined")
            $jo_entryModal_title.html(entryModal_newTitle_fixed);
        else
            $jo_entryModal_title.html($(this).text());
        $jo_entryModal_subtitle.html('');
        clear_modal_fields($jo_entryModal);
        try {
            jf_set_defaults_for_add();
        } catch(err) {}
        $jo_entryModal.modal('show');
    });

    // Form add/edit submit
    var is_add_more = false;
    $jo_entryModal_form.validate({
        ignore: 'input[type=hidden], .ignore',
        onkeyup: false,
        rules: entryModal_rules,
        submitHandler: function(form) {
            var id = $jo_entryModal_form.find('input[name="id"]').val();
            ajax_post_form($jo_entryModal_form, 'Save Successful', function(resp) {
                bool_has_modal_change = true;
                if (id == '' || id == undefined) {
                    if (is_add_more) {
                        clear_modal_fields($jo_entryModal);
                        is_add_more = false;
                    }
                    else {
                         $jo_entryModal.modal('hide');
                    }
                    try {
                        jf_entryModal_processNew($jo_entryModal, resp);
                    } catch(err) {}
                }
            }, function() {
                return false;
            });
        }
    });

    // Form Add More
    $jo_entryModal_form.find('button.btn-addmore').click(function(event) {
        is_add_more = true;
        $jo_entryModal_form.submit();
    });


    // On Close Modal
    $jo_entryModal.on('shown.bs.modal', function (e) {
        bool_has_modal_change = false;
    });
    $jo_entryModal.on('hidden.bs.modal', function (e) {
        if (bool_has_modal_change) jqry_dTbl.draw(false); //-- reload the datatable
    });
    //------------------------------------


    //====================================================================
    function clear_modal_fields($modal) {
        $modal.find('input[name="id"], input[type="text"], input[type="number"], input[type="email"], textarea').val('');
        $modal.find('select.select2').val('').trigger('change');
        $modal.find('input[type="checkbox"]').prop('checked', false);
        // If exists
        if($modal.find('input[id="modal_tags"]').length > 0){
            $modal.find('input[id="modal_tags"]').tagsManager('empty');
        }
    }

    // For Datatable
    function toggle_datatable_loader(to_show) {
        if (to_show) {
            $jo_tblRecords_loader.css('display', 'block');
            $jo_tblRecords.find('tbody').hide();
            // $('divs_paginate, div.dataTables_info').hide();
            $btn_delete_selected.hide();
            $('div.jqdt-row-b').addClass('hide');
        }
        else {
            $jo_tblRecords_loader.css('display', 'none');
            $jo_tblRecords.find('tbody').show();
            // $('div.dataTables_paginate, div.dataTables_info').show();
            $('div.jqdt-row-b').removeClass('hide');
        }
    }
    function datatableDrawBack() {
        var is_empty = ($jo_tblRecords.find('td.dataTables_empty').length > 0);
        var curr_page = jqry_dTbl.page() + 1;

        if ($jo_txt_search_tblRecords.val() == '' && is_empty && curr_page == 1) {
            if (!is_disable_auto_add_on_blank) {
                swal_confirm("No " + no_data_string + " Found", "Do you want to create?", function() {
                    $('#jo_btn_add_to_entryModal').click();
                    $('#jo_btn_add_to_entry').click();
                    $('#network-wizard').click();
        		});
            }
        }
        try {
            exec_on_dt_load_custom();
        } catch(err) {}
        $jo_btn_add_to_entryModal.prop("disabled", false);
        $cb_select_all.prop('checked', false);
        selected_ids = [];
        $btn_delete_selected.prop('disabled', true);

        return (is_empty && curr_page > 1);
    }

    function highlight_selected_row() {
        $("#jo_tblRecords tbody tr").removeClass('row_selected');
		$jo_tblRecords.find('input[value="'+selected_row_id+'"]').parents('tr').addClass('row_selected');
    }

    function proceed_click_detail(page_heading) {
        var ignored_pages = ['Merchants', 'Profile Sets', 'Users'];
        var is_proceed = true;

        $.each(ignored_pages, function(k, v) {
            if (page_heading == v) {
                is_proceed = false;
            }
        });
        return is_proceed;
    }


    //------
    // Load details on the left side of screen
    //------
    //- Get first item; show on right side
    function exec_on_dt_load() {
        var is_empty = ($jo_tblRecords.find('td.dataTables_empty').length > 0);

        if (is_empty) {
            //- no records, display default text
            $div_sel_detail.addClass('hide');
        }
        else {
            selected_row_id = $.cookie('selected_row_id');
            if (selected_row_id != '' && $jo_tblRecords.find('input[value="'+selected_row_id+'"]').length > 0) {
                highlight_selected_row();
                $jo_tblRecords.find('input[value="'+selected_row_id+'"]').parents('tr').click();
            }
            else {
                selected_row_id = ''
                $jo_tblRecords.find('tbody tr').first().click();
            }
        }
    }

    function exec_record_detail(right_side_url, id) {
        $div_sel_detail.removeClass('hide').html('Loading, please wait...');
        $.get(right_side_url.replace('jqrec_id_val', id), function(resp) {
            $div_sel_detail.html(resp);
            $div_sel_detail.find('select.select2').select2();
            var page_heading = $('div.page-heading').find('h2').html();
            if (proceed_click_detail(page_heading)) {
                var active_tab = $.cookie('active_tab');
                $('a[href="'+active_tab+'"]').click();
            }
        })
        .fail(function() {
            toastr.clear();
            toastr['error']('Loading failed. Please try again later.');
        });
    }

    $('#div_sel_detail').on('click', 'ul.nav-tabs a', function () {
        var active_tab = $(this).attr('href');
        $.cookie('active_tab', active_tab);
    });


    function move_bottom_elements() {
        if (!onload_dt) {
            onload_dt = true;
            //-- move datatable bottom elements
            $('div.dataTables_info').appendTo($('div.jqdt-b1'));
            $('select[name="jo_tblRecords_length"]').appendTo($('div.jqdt-b2').find('span.pager-dropdown'));
            $('div.dataTables_paginate').appendTo($('div.jqdt-b2').find('span.pager-buttons'));
            $('div.tmp-jqdt-bottom').hide();
        }
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
