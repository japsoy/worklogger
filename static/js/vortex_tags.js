//--------------------------------------------------------------------------
//- Tags tab
//--------------------------------------------------------------------------
var g_tags;
var g_tags_recid;
var g_tags_posturl;
var g_tags_options;

function populate_tags() {
    var $tbl_tags = $('#tbl_tags');
    $tbl_tags.find('tbody').empty();
    $.each(g_tags, function(index, el) {
        addTagEntry($tbl_tags, index, el);
    });

    // tags - autocomplete
    var tag_options = g_tags_options;
    var $keyentry = $('#keyentry');
    $keyentry.autocomplete({
        lookup: tag_options,
        onSelect: function (suggestion) {
            // console.log('You selected: ' + suggestion.value);
        }
    });
}
function addTagEntry($tbl_tags, key, val) {
    $tbl_tags.find('tbody').append('<tr>' +
        '<td class="tdkey">'+key+'</td>' +
        '<td class="tdval">'+val+'</td>' +
        '<td><button class="del_field btn btn-danger btn-outline btn-xs" type="button" title="Delete this entry"><i class="fa fa-minus"></i></button></td>' +
    '</tr>');
}


$(function() {
    var $tab_tags = $('#tab-tags');
    var $tbl_tags = $('#tbl_tags');
    var $keyentry = $('#keyentry');
    var $valentry = $('#valentry');
    $keyentry.hide();
    $valentry.hide();


    $tab_tags.find('button.save_tags').click(function(event) {
        var tags = {};
        var tkey, tval, strTags;
        $.each($tbl_tags.find('tbody').find('tr'), function(index, el) {
            tkey = $(this).find('td.tdkey').html();
            tval = $(this).find('td.tdval').html();
            if (tkey.length > 0 && tval.length > 0) tags[tkey] = tval;
        });
        strTags = JSON.stringify(tags);
        ajax_post(g_tags_posturl, {id: g_tags_recid, tags: strTags}, 'Tags saved succesfully', function() {
                try {
                    gf_tags_post_drawback();
                } catch (e) {}
            },
            function() {}
        );
    });
    $tab_tags.find('button.discard_tags').click(function(event) {
        swal_confirm('Discard changes?', 'Any unsaved changes will be lost', function() {
            populate_tags();
        });
    });
    $tab_tags.find('button.add_field').click(function(event) {
        if ($tbl_tags.find('tbody').find('tr').length > 0) {
            //-- check if last row is blank
            var last_entry_cnt = $tbl_tags.find('tr').last().find('td.tdkey').html().length +
                                 $tbl_tags.find('tr').last().find('td.tdval').html().length;
            if (last_entry_cnt == 0) {
                $tbl_tags.find('tr').last().find('button.del_field').click();
            }
        }

        addTagEntry($tbl_tags, '', '');
        $tbl_tags.find('tr').last().find('td.tdkey').click();
    });
    $tbl_tags.on('click', 'button.del_field', function(event) {
        $(this).closest('tr').remove();
    });
    $tbl_tags.on('click', 'td', function(event) {
        if ($(this).find('input').length > 0)
            return;

        var tdcontent = $(this).html();
        $(this).html('');
        if ($(this).hasClass('tdkey')) {
            $keyentry.appendTo($(this));
            $(this).append('<i class="fa fa-sort-down pull-right tag-icon"></i>');
            $keyentry.val(tdcontent).show().focus();
        }
        else if ($(this).hasClass('tdval')) {
            $valentry.appendTo($(this));
            $valentry.val(tdcontent).show().focus();
        }
    });

    $keyentry.keydown(function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 9) {
            e.preventDefault();
            $(this).closest('tr').find('td.tdval').click();
        }
    });
    $keyentry.blur(function(event) {
        tagentry_blur($(this));
    });
    $valentry.blur(function(event) {
        tagentry_blur($(this));
    });
    function tagentry_blur($tagentry) {
        var tdcontent = $tagentry.val();
        var $curr_td = $tagentry.closest('td');
        $tagentry.appendTo($tab_tags).hide();
        $curr_td.html(tdcontent);
    }
});
