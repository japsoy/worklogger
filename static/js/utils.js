//- Sweet alert confirm v1
function swal_confirm(title, text, exec_func, close_on_confirm) {
    var is_close_on_confirm = (typeof close_on_confirm === "undefined");

    swal({
        title: title,
        text: text,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: is_close_on_confirm,
        showLoaderOnConfirm: true
    }, function(isConfirm) {
        if (isConfirm) {
            exec_func();
        }
    });
}
//- Sweet alert confirm v2 (with action if user clicks 'cancel')
function swal_confirm2(title, text, exec_func, canc_func) {
    swal({
        title: title,
        text: text,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
    }, function(isConfirm) {
        if (isConfirm) {
            exec_func();
        }
        else {
            canc_func();
        }
    });
}

function swal_prompt(title, text, inputValue, exec_func) {
    swal({
    	title: title,
    	text: text,
    	type: "input",
    	showCancelButton: true,
    	closeOnConfirm: false,
    	animation: "slide-from-top",
    	inputValue: inputValue,
        showLoaderOnConfirm: true
    }, function(inputValue) {
    	if (inputValue === false) return false;
    	if (inputValue === "") {
    		swal.showInputError("This field is required");
    		return false
    	}

        exec_func(inputValue);
    });
}

//- convert hh:mm:ss format to seconds
function conv_hms_to_sec(input_val) {
    var a = input_val.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
}
function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


//- Show loader modal
function toggle_loader(show_loader) {
    if (show_loader) {
        $('#div_loader').modal('show');
    } else {
        $('#div_loader').modal('hide');
    }
}


function swal_toaster_feedback(toastr_asfeedback, msg, feedback_type, other_msg, $container){
    if (toastr_asfeedback){
        if (feedback_type == "error") {
            toastr.error(other_msg, msg, {timeOut: 120000});
        }
        else {
            toastr[feedback_type](other_msg, msg);
        }
    }
    else {
        swal({
            title: msg,
            text: other_msg,
            type: feedback_type
        }, function() {
            if ($container) {
                $container.find('input[type="text"]').first().focus();
            }
        });
    }
}


//- ajax post (will show modal loader)
function ajax_post_with_csrf_token(url_action, params, csrftoken, success_msg, success_func, always_func, toastr_asfeedback, addtl_msgs) {
    var request;
    var is_toastr_asfeedback = false;
    if (typeof toastr_asfeedback !== "undefined") is_toastr_asfeedback = toastr_asfeedback;
    var addtl_msgs = (typeof addtl_msgs !== "undefined")? addtl_msgs: '';

    toastr.clear();
    toggle_loader(true);
    request = $.ajax({
        url: url_action,
        method: "POST",
        data: params,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        },
    });

    request.done(function(resp) {
        var resp_msgs;
        if (resp.hasOwnProperty('error')) {
            swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , resp.error, null);
        }
        else if (resp.hasOwnProperty('error_list')) {
            resp_msgs = '';
            $.each(resp.error_list, function(idx, curr_msg) {
                if (resp_msgs.length > 0) resp_msgs += '<br>';
                resp_msgs += curr_msg;
            });
            if (resp_msgs.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , resp_msgs, null);
            }
        }

        if (resp.hasOwnProperty('success_list')) {
            resp_msgs = '';
            $.each(resp.success_list, function(idx, curr_msg) {
                if (resp_msgs.length > 0) resp_msgs += '<br>';
                resp_msgs += curr_msg;
            });
            if (resp_msgs.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, success_msg, "success" , resp_msgs, null);
            }
            success_func(resp);
        }
        else if (resp.hasOwnProperty('success') || resp.hasOwnProperty('status')) {
            if (success_msg.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, success_msg, "success", addtl_msgs, null);
            }
            success_func(resp);
        }
    });

    request.fail(function(jqXHR, textStatus) {
        swal_toaster_feedback(is_toastr_asfeedback, "Server Error", "error", "Please try again later.", null);
    });
    request.always(function(jqXHR, textStatus) {
        always_func();
        toggle_loader(false);
    });
}

function ajax_post(url_action, params, success_msg, success_func, always_func, toastr_asfeedback, addtl_msgs) {
    var is_toastr_asfeedback = false;
    if (typeof toastr_asfeedback !== "undefined") is_toastr_asfeedback = toastr_asfeedback;
    var addtl_msgs = (typeof addtl_msgs !== "undefined")? addtl_msgs: '';

    toastr.clear();
    toggle_loader(true);

    $.post(url_action, params, function(resp) {
        var resp_msgs;
        if (resp.hasOwnProperty('error')) {
            swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , resp.error, null);
        }
        else if (resp.hasOwnProperty('error_list')) {
            resp_msgs = '';
            $.each(resp.error_list, function(idx, curr_msg) {
                if (resp_msgs.length > 0) resp_msgs += '<br>';
                resp_msgs += curr_msg;
            });
            if (resp_msgs.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , resp_msgs, null);
            }
        }

        if (resp.hasOwnProperty('success_list')) {
            resp_msgs = '';
            $.each(resp.success_list, function(idx, curr_msg) {
                if (resp_msgs.length > 0) resp_msgs += '<br>';
                resp_msgs += curr_msg;
            });
            if (resp_msgs.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, success_msg, "success" , resp_msgs, null);
            }
            success_func(resp);
        }
        else if (resp.hasOwnProperty('success') || resp.hasOwnProperty('status')) {
            if (success_msg.length > 0) {
                swal_toaster_feedback(is_toastr_asfeedback, success_msg, "success", addtl_msgs, null);
            }
            success_func(resp);
        }
    })
    .fail(function() {
        swal_toaster_feedback(is_toastr_asfeedback, "Server Error", "error", "Please try again later.", null);
    })
    .always(function() {
        always_func();
        toggle_loader(false);
    });
}

//- ajax post (will disable buttons)
function ajax_post_form($frmProcess, success_msg, success_func, always_func, toastr_asfeedback) {
    var is_toastr_asfeedback = false;
    if (typeof toastr_asfeedback !== "undefined") is_toastr_asfeedback = toastr_asfeedback;

    toastr.clear();
    var origBtnHtml = $frmProcess.find('button[type="submit"]').html();
    var serialized = $frmProcess.serialize();
    $frmProcess.find('input, button, textarea, select').prop('disabled', true);
    btn_loader_submit($frmProcess.find('button[type="submit"]'), true);

    $.post($frmProcess.attr('action'), serialized, function(resp) {
        if (resp.hasOwnProperty('error')) {
            swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , resp.error, $frmProcess);
        }
        else if (resp.hasOwnProperty('error_list')) {
            $.each(resp.error_list, function(idx, error_msg) {
                swal_toaster_feedback(is_toastr_asfeedback, "Process failed.", "error" , error_msg, $frmProcess);
            });
        }
        else if (resp.hasOwnProperty('success') || resp.hasOwnProperty('status')) {
            override_msg = success_msg;
            if (resp.hasOwnProperty('override_msg')) {
                override_msg = resp.override_msg;
            }
            addtl_msg = '';
            if (resp.hasOwnProperty('addtl_msg')) {
                addtl_msg += resp.addtl_msg;
            }

            if (success_msg != ''){
                swal_toaster_feedback(is_toastr_asfeedback, override_msg, "success", addtl_msg, $frmProcess);
            }
            success_func(resp);
        } else {
            swal_toaster_feedback(is_toastr_asfeedback, "Process failed. Please reload page", "error" , resp.error, $frmProcess);
        }
    })
    .fail(function() {
        swal_toaster_feedback(is_toastr_asfeedback, "Server Error", "error", "Please try again later.", $frmProcess);
    })
    .always(function(resp) {
        $frmProcess.find('input, button, textarea, select').prop('disabled', false);
        btn_loader_submit($frmProcess.find('button[type="submit"]'), false, origBtnHtml);
        always_func(resp);
    });
}


// Button change label
function btn_loader($btn, state, orig_text) {
    if (state) {
        $btn.children('*:not(option)').addClass('fa-spin');
        $btn.contents().last().replaceWith(" Processing...");
    } else {
        $btn.children().removeClass('fa-spin');
        $btn.contents().last().replaceWith(" "+ orig_text);
    }
}
function btn_loader_submit($btn, state, origBtnHtml) {
    if (state) {
        $btn.html('<i class="fa fa-circle-o-notch fa-spin"></i> Processing...');
    } else {
        $btn.html(origBtnHtml);
    }
}


//* Check if JSON *//
function validate_JSON(param){
    var validator = true
    try {
        JSON.parse(param);

    } catch (e) {
        swal("Process failed.", "Config is not in JSON format.", "error");
        // toastr.error('Config is not in JSON format.', 'Process failed.', {timeOut: 120000});
        validator = false
    }
    return validator;

}
//* Validate duplicate key name *//
function validate_tags(form){
    var tkeys =$('#'+form).find('.tkey');
    var value = true;
    var akey = new Array();
    i=1;
    $.each(tkeys, function(i, txtbox){
        if($(txtbox).val() != '' || $(txtbox).val() == 'undefined'){

            akey[i] = $(txtbox).val();
        }
        i++;
    });
    var akey_unique = akey.filter(function(item, i, ar){ return ar.indexOf(item) == i; });
    if(akey.length == akey_unique.length){

    }else{
        swal("Process failed.", "Duplicate Key.", "error");

        value = false;
    }
    return value;
}

//- Check file type
$.fn.checkFileType = function(options) {
    var defaults = {
        allowedExtensions: [],
        success: function() {},
        error: function() {}
    };
    options = $.extend(defaults, options);

    return this.each(function() {

        $(this).on('change', function() {
            var value = $(this).val(),
                file = value.toLowerCase(),
                extension = file.substring(file.lastIndexOf('.') + 1);

            if ($.inArray(extension, options.allowedExtensions) == -1) {
                options.error();
                $(this).focus();
            } else {
                options.success();
            }
        });

    });
};


//- Popover
$('li[data-toggle="popover"]').popover({ trigger: "hover", delay: { "show": 100, "hide": 100 }, container: 'body' });


//-- switchery toggle
//-- sample use:
//      <input type="checkbox" class="jsswitch" name="text_cbx" />
//      var elem = document.querySelector('.jsswitch');
//      var init = new Switchery(elem);
//      toggle_cbx(false, elem, '.jsswitch');
function toggle_cbx(is_checked, cbx_elem, sw_class) {
    if ((is_checked && !cbx_elem.checked) || (!is_checked && cbx_elem.checked))
        $(sw_class).click();
}


// var $admin_notif = $('#main_notif'); //-- for admin side
// function admin_notif_ctr() {
//     try {
//         $.get("/admin/get/notif-counter", function(resp) {
//             $admin_notif.find('span.badge_consumer').html(numberWithCommas(resp.approvals));
//             // $admin_notif.find('span.badge_order1').html(numberWithCommas(resp.orders_new));
//             // $admin_notif.find('span.badge_order2').html(numberWithCommas(resp.orders_paid));
//             var total_notif = resp.approvals; //+ resp.orders_new + resp.orders_paid;
//             $admin_notif.find('span.badge_total').html(numberWithCommas(total_notif));
//             if (total_notif > 0) {
//                 $admin_notif.find('span.badge_total').removeClass('hide');
//                 $admin_notif.find('span.status_text').html('For your approval');
//             }
//             else {
//                 $admin_notif.find('span.badge_total').addClass('hide');
//                 $admin_notif.find('span.status_text').html('Nothing to approve');
//             }
//             $admin_notif.find('span.time_elapsed').livestamp(new Date());

//             //-- dashboard counters
//             $('h2.dshb_new_consumer').html($admin_notif.find('span.badge_consumer').html());
//             // $('h2.dshb_new_order').html($admin_notif.find('span.badge_order1').html());
//             // $('h2.dshb_paid_order').html($admin_notif.find('span.badge_order2').html());
//         });
//     } catch (e) {
//         console.log('ERROR: Notif update failed!', e);
//     }
// }


$(function() {
    // bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip()

    // toaster default option
    toastr.options = {
        "closeButton": false,
        "positionClass": "toast-top-full-width",
        "closeButton": true
    };

    // set focus on modal first text field
    $('div.modal').on('shown.bs.modal', function (e) {
        $(this).find('input[type="text"]').first().focus();
    });

    // select2 init
    $('select.select2').select2();
    $('select.select2-wo-search').select2({ minimumResultsForSearch: Infinity });

    //- new html select (selectpicker)
    $('select.selectpicker').selectpicker({
        style: 'btn-white'
    });


    //- Redirect Button
    $('button.btn_redirect, a.btn_redirect').click(function(event) {
        toggle_loader(true);
    });


    //- scroll up/down feature
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }

		if($(this).scrollTop() + $(this).height() > $(document).height() - 100) {
            $('.scrolldown').fadeOut();
		} else {
            $('.scrolldown').fadeIn();
		}
    });

    $('.scrollup').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 'fast');
        return false;
    });

    $('.scrolldown').click(function () {
        $("html, body").animate({
            scrollTop: $(document).height()
        }, 'fast');
        return false;
    });

    //- detect [enter] keypress on sweet-alert
    $(document).keypress(function(e) {
        if(e.which == 13) {
            var $sweet_alert = $('div.sweet-alert');
            if ($sweet_alert.hasClass('visible')) {
                $sweet_alert.find('button.confirm').click();
                e.preventDefault();
            }
        }
    });
    //- detect escape
    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            var $sweet_alert = $('div.sweet-alert');
            if ($sweet_alert.hasClass('visible')) {
                $sweet_alert.find('button.cancel').click();
                e.preventDefault();
            }
        }
    });
    //- detect backspace
    var rx = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e){
        if( e.which == 8 ){ // 8 == backspace
            if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
                e.preventDefault();
            }
        }
    });


    // //- set updated time on main notif
    // if ($admin_notif.length > 0) {
    //     admin_notif_ctr();
    //     setInterval(admin_notif_ctr, 1800000); //- 1800000 (30 minutes)
    // }
});
