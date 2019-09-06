// Hide modal when page load
function hideModalOnLoad() {
    $(window).on('load', function () {
        $('.modal').modal('hide');
    });
}
hideModalOnLoad();

//Toggle sub menu logout
function toggleSubMenu() {
    //Open sub-menu
    $('.btn-logout').click(function () {
        $('.sub-menu').slideToggle(300);
    });
    //Close sub-menu by click anywhere on page
    $(document).on("click", function (event) {
        var $trigger = $(".sub-menu").closest('li');;
        if ($trigger !== event.target && !$trigger.has(event.target).length) {
            $(".sub-menu").slideUp(300);
        }
    });
}
toggleSubMenu();

//  set max-height for table sticky 
function tbHeight() {
    windowHeight = $(window).outerHeight();
    jsStickyTable = $('.js-sticky-table');
    if ((jsStickyTable)[0]) {
        windowHeight = $(window).outerHeight();
        topNavHeight = $('.top-nav').outerHeight();
        headerHeight = $('header').outerHeight();
        mainNnavHeight = $('.main-nav').outerHeight();
        toolsHeight = $('.tools').outerHeight();
        groupToolsHeight = $('.group-tool').outerHeight(); //group status filter phase 2
        paggingHeight = $('.bottom-nav').outerHeight();
        footerHeight = $('footer').outerHeight();
        if (!$.isNumeric(toolsHeight)) toolsHeight = 0;
        if (!$.isNumeric(groupToolsHeight)) groupToolsHeight = 0;
        if (!$.isNumeric(paggingHeight)) paggingHeight = 0;
        $(jsStickyTable).css({
            'max-height': windowHeight - topNavHeight - headerHeight - mainNnavHeight - toolsHeight - groupToolsHeight - paggingHeight - footerHeight - 30 // 30 is margin with footer
        })
        // console.log(windowHeight, topNavHeight, headerHeight, mainNnavHeight, toolsHeight, groupToolsHeight, paggingHeight, footerHeight,  windowHeight - topNavHeight - headerHeight - mainNnavHeight - toolsHeight - groupToolsHeight - paggingHeight - footerHeight);
    }
}
tbHeight();

// Toggle right menu
function openRightMenu() {
    btnOpen = $('.btn-view');
    btnClose = $('.btn-close');
    rightMenu = $('.right-menu');
    btnOpen.click(function () {
        $('body').addClass('right-menu-open');
    });
    btnClose.click(function () {
        $('body').removeClass('right-menu-open');
    });
    //Close right-menu by click anywhere on page
    $(document).mouseup(function (e) {
        if (!rightMenu.is(e.target) // if the target of the click isn't the container...
            &&
            rightMenu.has(e.target).length === 0) { // ... nor a descendant of the container
            $('body').removeClass('right-menu-open');
        }
    });
}
openRightMenu();

// disabled link in rightmenu
function disableLink() {
    $('.right-menu__content a').addClass('isDisabled');
}
disableLink();


// no display ¶ in rightmenu
function noDisplayChar() {
    $('.right-menu__content a:contains(¶)').css('display', 'none');
}
noDisplayChar();
//date picker of jquey ui
function inputDatePicker() {
    var curentFrom;
    var curentTo;
    var fromDate = $('[data-picker="form-date"]');
    var toDate = $('[data-picker="to-date"]')
    if (fromDate[0] && toDate[0]){
        fromDate.datepicker({
            dateFormat: "yy-mm-dd",
            beforeShow: function(date) {
                setTimeout(function(){
                    $('.ui-datepicker').css('z-index', 6);
                }, 0);
                curentFrom = fromDate.val();
                fromDate.datepicker( "setDate", "" );
                fromDate.datepicker( "option", "defaultDate", curentFrom );
            },
            onClose: function() {
                if (fromDate.val()==""){fromDate.datepicker( "setDate", curentFrom );}
            },
            onSelect: function( selectedDate ) {
                toDate.datepicker( "option", "minDate", selectedDate );
            }
        });
  
        toDate.datepicker({
            dateFormat: "yy-mm-dd",
            beforeShow: function(date) {
                setTimeout(function(){
                    $('.ui-datepicker').css('z-index', 6);
                }, 0);
                curentTo = toDate.val();
                toDate.datepicker( "setDate", "" );
                toDate.datepicker( "option", "defaultDate", fromDate.val() );
            },
            onClose: function() {
                if (toDate.val()==""){toDate.datepicker( "setDate", curentTo );}
            },
            onSelect: function( selectedDate ) {
                fromDate.datepicker( "option", "maxDate", selectedDate );
            }
        });
    }
    
    var inMonth = $('[data-picker="in-month"]');
    if(inMonth[0]) {
        inMonth.MonthPicker({
            MonthFormat: 'yy-mm',
            Button: false,
            OnBeforeMenuOpen: function(event){
                // Make sure the user is aware of the consequences, and prevent opening if they say no.
                $('.month-picker-previous').find('.ui-button').css({'pointer-events':'auto', 'opacity' : 1, 'background-color': 'inherit', 'padding': '.2em 0', 'color': '#333'});
                $('.month-picker-title').find('.ui-button').css({'background': 'inherit'});
                $('.month-picker-next').find('.ui-button').css({'pointer-events':'auto', 'opacity' : 1, 'background-color': 'inherit', 'padding': '.2em 0'});
            }
        });
    };

    var lateDate = $('[data-picker="late-date"]');
    if(lateDate[0]) {
        lateDate.datepicker({
            dateFormat: "yy-mm-dd",
            // onSelect: function() {
            //     // change status of send late mail
            //     console.log(lateDate.val());
            //     if(lateDate.val().length<=0) {console.log('ko co')};
            // }
        }).datepicker("setDate", new Date());
    }
    var dayOff = $('[data-picker="day-off"]');
    if(dayOff[0]) {
        dayOff.datepicker({
            dateFormat: "yy-mm-dd"
        }).datepicker("setDate", new Date());
    }
}inputDatePicker();
/*Display form late or day off*/
function displayFormNonWorking(){
    var late = 'late';
    var dayOff = 'day-off';
    $('#'+late).click(function(){
        if (this.checked) {
            $('.form-'+late).removeClass('d-none');
            $('.form-'+dayOff).addClass('d-none');
        };
    });
    $('#'+dayOff).click(function(){
        if (this.checked) {
            $('.form-'+dayOff).removeClass('d-none');
            $('.form-'+late).addClass('d-none');
        };
    });
}displayFormNonWorking();
/*Form dayoff*/
function dayoffInput(){
    // Append input with text
    var appendInput = '.append-input';
    $(appendInput).click(function() {
        $(this).prev('input').focus();
    });
    // One day or more than one day
    var oneDay = 'one-day';
    var moreThanOne = 'more-than-one';
    var disableOneDay = function(){
        // $('.'+oneDay).find('select').attr('disabled', true);
        // $('.'+moreThanOne).find('input').attr('disabled', false);
        // $('.'+moreThanOne).find('button').attr('disabled', false);
        // $('.'+oneDay).addClass('form-group-disabled');
        // $('.'+moreThanOne).removeClass('form-group-disabled');
        $('.'+oneDay).find('select').attr('disabled', true);
        $('.btn-repeat').attr('disabled', false);
        $('.'+oneDay).addClass('form-group-disabled');
    };
    var disableMoreThanOne = function(){
        // $('.'+moreThanOne).find('input').attr('disabled', true);
        // $('.'+moreThanOne).find('button').attr('disabled', true);
        // $('.'+oneDay).find('select').attr('disabled', false);
        // $('.'+moreThanOne).addClass('form-group-disabled');
        // $('.'+oneDay).removeClass('form-group-disabled');
        $('.btn-repeat').attr('disabled', true);
        $('.'+oneDay).find('select').attr('disabled', false);
        $('.'+oneDay).removeClass('form-group-disabled');
    };
    $('#'+oneDay).click(function(){
        if (this.checked) {
            disableMoreThanOne();
        };
    });
    $('#'+moreThanOne).click(function(){
        if (this.checked) {
            disableOneDay();
        };
    });
    
}dayoffInput();
// -------------------------------
function repeatHandle(close, ele, selector, iterator) {
    var limit = ele.data('limit');
    var parent = '#'+selector;
    var repeatable = $(parent).find('.repeatable-template').clone(true);
    // clear data
    $(repeatable).find('input, textarea').val('');
    $(repeatable).find('input[type*="radio"], input[type*="checkbox"]').prop('checked', false);
    $(repeatable).find('.text-show').html('');
    $(repeatable).removeClass('repeatable-template').addClass('repeatable-row').removeClass('d-none');
    
    // add button close
    $(repeatable).find('.btn-close-repeat-item').removeClass('d-none').attr('data-close', selector);
    $(repeatable).find('.hasDatepicker').each(function(index, val) {
        $(this).append('<input type="text" class="form-control form-control-sm mw-90" data-picker="day-off"');
        $('[data-picker="day-off"]').datepicker({dateFormat: "yy/mm/dd"}).datepicker("setDate", new Date());
    });
    // update iterator
    ele.data('iterator', iterator);
    ele.attr('data-iterator', iterator );
    if(close == false) {
        if (iterator >= limit && limit != "unlimited" && limit != '' && typeof limit != "undefined") {
            ele.prop({ disabled: true}).css({ opacity: 0 });
        } else {
            ele.prop({ disabled: false}).css({ opacity: 1 });
        }
        $(parent).append(repeatable);

    } else {
        ele.prop({ disabled: false}).css({ opacity: 1 });
        close.closest('.repeatable-row').remove();
    }
}
/*
* add form tempate
*
*/
function addHandle() {
    $('.btn-repeat').on('click', function(e){
        var close = false;
        var $this = $(this);
        var ele = $(this);
        var selector = $this.data('selector');
        var iterator = $this.data('iterator');          
            iterator = iterator + 1;
        repeatHandle(close, ele, selector, iterator);
    });
}addHandle();
/*
* remove form template
*
*/
function closeHandle() {
    var btnAdd = '.btn-repeat';
    $('.btn-close-repeat-item').hover(function(){
      $(this).closest('.repeatable-row').toggleClass('repeatable-row-hover');
    });
    $('.btn-close-repeat-item').on('click', function(e){
        var close = $(this);
        var ele = $(btnAdd);
        var selector = $(this).data('close');
        var iterator = ele.data('iterator');
            iterator = iterator - 1;
        repeatHandle(close, ele, selector, iterator);       
    });
}closeHandle();
/*
* add html row
* @ .btn-addhtmlrow class of button
* @ .rowhtmltempalte class of html closest
*/
function addHtml() {
    var btn = '.btn-addhtmlrow';
    $(btn).on('click', function(){
        var parent = $(this).closest('.rowhtmltempalte');
        var template = $(parent).clone(true);
        $(template).insertAfter(parent);
    })
}addHtml();
// Validate form
// function validateForm(){
//     // Form late
//     var btnSendMailLate = '.btn-send-mail-late';
//     var formLateInput = '.form-late .form-control';
//     var lateDate = '#late-date';
//     var reasonLate = '#reason-late';
//     $(btnSendMailLate).prop('disabled', true);
//     // $(lateDate).on('blur', function(){
//     //     console.log($(lateDate).val());
//     //     if ($(lateDate).val() != '' && $(reasonLate).val().length > 0) {
//     //         $(btnSendMailLate).prop('disabled', false);
//     //     } else{
//     //         $(btnSendMailLate).prop('disabled', true);
//     //     }
//     // });
//     $(formLateInput).on('keyup', function(){
//         if ($(lateDate).val().length > 0 && $(reasonLate).val().length > 0) {
//             $(btnSendMailLate).prop('disabled', false);
//         } else{
//             $(btnSendMailLate).prop('disabled', true);
//         }
//     });
// }validateForm();
