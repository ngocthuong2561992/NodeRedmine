// Datatable
function dataTable(){
    dataTable = $('.datatable');
    if (dataTable[0]) {
        //Get height table
        heightTableWrapper = parseFloat($('.js-sticky-table').css('max-height'));
        heightSearch = 80;
        heightTable = heightTableWrapper - heightSearch - 27 - 30; //27 is height header of table, 30 is margin in tool header
        // console.log(heightTableWrapper);
        // console.log(heightTable);
        dataTable.DataTable({
            scrollY: heightTable,
            scrollX: true,
            scrollCollapse: true,
            paging: false,
            info: false,
            filter: true,
            'dom':' <"search"f><"top"l>rt<"bottom"ip><"clear">',
            'language': {
                search: 'Keywords:',
            },
            ordering: true,
            columnDefs: [{
              orderable: false,
              targets: "no-sort"
            }]

        });
        $('#DataTables_Table_0_filter').addClass('fieldset pb-0 mb-3 mt-0').prepend('<h4><span>Filter</span></h4>');
    }
}dataTable();

//remove row on Datatable
function removeRowDT(){
    tableRemoveRow = $('.table-remove-row');
    if (tableRemoveRow[0]){
        $('.btn-delete').on('click', function(){
            btnDel = $(this);
            $('.btn-confirm-del').on('click', function(){
                //hide modal delete
                $('#deleteModal').modal('hide');
                //Add class select on clicked row
                $('.table-remove-row tbody tr').removeClass('selected');
                btnDel.closest('tr').addClass('selected');
                //delete row
                tableRemoveRow.DataTable().row('.selected').remove().draw( false );
                //Reorder column NO after delete
                $('td.order').text(function (i) {
                  return i + 1;
                });
            });
        });
    }
}removeRowDT()

//x-editable inline
function editTable() {
    if ($('.table-edit')[0]) {
        $.fn.editable.defaults.mode = 'inline';

        $('.name-edit').editable();
        $('.name-edit').on('click',function(){
          $(this).next().find('.editable-input input').attr('name','input-edit-name');
          $(this).next().find('.editable-input input').addClass('form-control form-control-sm custom-input');
          $(this).next().find('.editable-input input').attr('onkeypress','enterEventEdit()');
        });

        $('.g-suite-edit').editable();
        $('.g-suite-edit').on('click',function(){
          $(this).next().find('.editable-input input').attr('name','input-edit-gsuite');
          $(this).next().find('.editable-input input').addClass('form-control form-control-sm custom-input');
          $(this).next().find('.editable-input input').attr('onkeypress','enterEventEdit()');
        });
        $('.from-edit').editable();
        $('.from-edit').on('click',function(){
          $(this).next().find('.editable-input input').attr('name','input-edit-from');
          $(this).next().find('.editable-input input').addClass('form-control form-control-sm custom-input');
          $(this).next().find('.editable-input input').attr('onkeypress','enterEventEdit()');
        });
        $('.to-edit').editable();
        $('.to-edit').on('click',function(){
          $(this).next().find('.editable-input input').attr('name','input-edit-to');
          $(this).next().find('.editable-input input').addClass('form-control form-control-sm custom-input');
          $(this).next().find('.editable-input input').attr('onkeypress','enterEventEdit()');
        });
        //Style icon button
        $.fn.editableform.buttons = 
          '<button onclick="edit()" type="button" class="btn btn-outline-primary editable-submit btn-xs text-center"><span class="oi" data-glyph="check"></span></button>' +
          '<button type="button" id="cancelEdit" class="btn btn-outline-secondary editable-cancel btn-xs"><span class="oi" data-glyph="x"></span></button>'; 
    }
}editTable();

//Datatable workload
function dataTableWL() {
    var start = 3;
    dataTable = $('.datatable-wl');
    multiSelect = $('.multi-select');
    if (dataTable[0]) {
        //Get height table
        heightTableWrapper = parseFloat($('.js-sticky-table').css('max-height'));
        // heightSearch = 33.5;
        heightTable = heightTableWrapper - 105; //105 is height header of table, 30 is margin in tool header
        // console.log(heightTableWrapper);
        // console.log(heightTable);
        dataTables = dataTable.DataTable({
            scrollY: heightTable,
            scrollX: true,
            scrollCollapse: true,
            paging: false,
            info: false,
            filter: true,
            filterAcceptOnEnter: true,
            'dom':' <"search"f><"top"l>rt<"bottom"ip><"clear">',
            'dom': '<"search">frtip',
            'language': {
                search: 'Keywords:',
            },
            fixedColumns: {
                leftColumns: 5
            },
            select: true,
        } );
        $('#DataTables_Table_0_filter').addClass('custom-search');
        $('.fieldset').removeAttr("style");
        $('.fieldset').css('visibility', 'visible');
        if (multiSelect [0]) {
            //Multi select
            var arrSelected = [];
            // Get value order first column
            var start = 5;
            //Get value order last column
            var numberOption = $('.multi-select option').length;
            var end = start + numberOption - 1;
            // number of close menu
            var i = 0;
            multiSelect.multipleSelect({
                displayDelimiter: ' | ',
                filter: true,
                multipleWidth: 55,
                width: 300,
                onClose: function() {
                    // Number of items previous list
                    oldArr = arrSelected;
                    var selected = multiSelect.multipleSelect('getSelects');
                    arrSelected = selected.map(function (item) {
                        var val = item.split('-');
                        return Number(val[0]);
                    });
                    i = i + 1;
                    var hideAll = function(){
                        $('.loading').css('display', 'block');
                            setTimeout(function(){
                                //Hide all column
                                for (var i=start; i <= end; i++) {
                                    columns = dataTables.column(i).visible(0);
                                }
                                setRowUser(selected);///run filter member user of project
                                $('.loading').css('display', 'none');
                            });
                    };
                    var showColumnFilter = function(){
                        $('.loading').css('display', 'block');
                            setTimeout(function(){
                                //Hide all column
                                for (var i=start; i <= end; i++) {
                                    columns = dataTables.column(i).visible(0);
                                }
                                //Show column is selected
                                $.each(arrSelected, function( index, value ) {
                                  columns = dataTables.column(value).visible(1);
                                });
                                setRowUser(selected);///run filter member user of project
                                $('.loading').css('display', 'none');
                            });
                    };
                    if (arrSelected.length == 0){
                        // Click uncheckall first time
                        if ( i == 1) {
                            hideAll();
                        }
                        else {
                            // Click uncheckall after first close filter
                            if (oldArr.length != 0) {
                                hideAll();
                            }
                        };
                        
                    }
                    // Click select all
                    if (arrSelected.length == numberOption) {
                        $.each(arrSelected, function( index, value ) {
                            if(dataTables.column(value).visible() == 0) {
                                showColumnFilter();
                                return false;
                            }
                        });
                    }
                    // Click some options in multi select
                    else {
                        $.each(arrSelected, function( index, value ) {
                            if ((oldArr.length != arrSelected.length) || (dataTables.column(value).visible() == 0)) {
                                showColumnFilter();
                                return false;
                            }
                        });
                    }
                },
            });
            $('.multi-select input[type="checkbox"]').prop('checked', true);
            if ($('input[data-name="selectAll"]').prop('checked') == true) {
                $('.ms-choice').find('span').text("All selected");
            }
        }
    }
}dataTableWL();

function setRowUser(arrSelected) {
    var Selected = arrSelected.map(function (item) {
        var val = item.split('-');
        return Number(val[1]);
    });
    var numberOption = $('.multi-select option').length;
    let rowUser = $('.row-users');
    if (Selected.length === numberOption) {
        for (var i = 0; i < rowUser.length; i++) {
            $('.row-users:eq('+i+')').css('visibility', 'visible');
        }
    }
    else if (Selected.length === 0) {
        for (var i = 0; i < rowUser.length; i++) {
            $('.row-users:eq('+i+')').css('visibility', 'collapse');
        }
    }
    else {
        var url = "/workload/getProjectUser";
        $.ajax({
        	url: url,
        	data: {
                projectIDs: Selected
            },
        	contentType: "application/json",
        	error: function() {
        	},
            dataType: 'json',
            type: 'GET',
        	success: function(data) {
                for (var i = 0; i < rowUser.length; i++) {
                    $('.row-users:eq('+i+')').css('visibility', 'collapse');
                }
                for (var j = 0; j < data.length; j++) {
                    $('.user-'+data[j]+'').css('visibility', 'visible');
                }
            }
        });
    }
}

//Datatable project
function dataTablePJ() {
    dataTable = $('.datatable-project');
    if (dataTable[0]) {
        //Get height table
        heightTableWrapper = parseFloat($('.js-sticky-table').css('max-height'));
        heightSearch = 80;
        heightTable = heightTableWrapper - heightSearch - 105; //105 is height header of table
        // console.log(heightTableWrapper);
        // console.log(heightTable);
        dataTables = dataTable.DataTable({
        scrollY: heightTable,
        scrollX: true,
        scrollCollapse: true,
        paging: false,
        info: false,
        filter: true,
        'dom':' <"search"f><"top"l>rt<"bottom"ip><"clear">',
        fixedColumns:   {
            leftColumns: 2
        },
        select: true,
        'language': {
            search: 'Keywords:',
        },
        } );
        $('#DataTables_Table_0_filter').addClass('fieldset pb-0 mb-3 mt-0').prepend('<h4><span>Filter</span></h4>');
    }
}dataTablePJ();

//Datatable project
function dataTableUser() {
    dataTable = $('.datatable-user');
    if (dataTable[0]) {
        //Get height table
        heightTableWrapper = parseFloat($('.js-sticky-table').css('max-height'));
        heightSearch = 80;
        heightTable = heightTableWrapper - heightSearch - 78; //78 is height header of table
        // console.log(heightTableWrapper);
        // console.log(heightTable);
        dataTables = dataTable.DataTable({
        scrollY: heightTable,
        scrollX: true,
        scrollCollapse: true,
        paging: false,
        info: false,
        filter: true,
        'dom':' <"search"f><"top"l>rt<"bottom"ip><"clear">',
        fixedColumns:   {
            leftColumns: 3
        },
        select: true,
        'language': {
            search: 'Keywords:',
        },
        } );
        $('#DataTables_Table_0_filter').addClass('fieldset pb-0 mb-3 mt-0').prepend('<h4><span>Filter</span></h4>');
    }
}dataTableUser();
