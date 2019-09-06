// Error Modal page User-Management
const textUserManagementModal = {
    errExist : "User or GSuit already exists! , Please add another user.",
    errAddEmpty : "Name or G-suite are not valid",
    errAddGSuit : "Enter a valid gsuite domain name. Ex:last.first@gigei.jp",
    errMin : "Length is short, minimum 2 required.",
    errMax : "Length is not valid, maximum 50 required.",
    errSpecialCharacter : "Do not enter special characters"
}

// Error Modal page Holiday-Management
const textHolidayManagementModal = {
    errExist : "Holiday's name or Date already exists! , Please add another holiday.",
    errAddEmpty : "Holiday's name or Date are not valid",
    errMin : "Length is short, minimum 2 required.",
    errMax : "Length is not valid, maximum 50 required.",
    errSpecialCharacter : "Do not enter special characters",
    errFormatDate : "You entered the wrong date format (YYYY-MM-DD). Ex:2019-01-01\n \
                    OR The date you entered is more than the day of the month",
    errFromGreaterTo : "Date \"From\" must be smaller than Date \"To\"",
    errToSmallerFrom : "Date \"To\" must be greater than Date \"From\""
}

module.exports = { textUserManagementModal, textHolidayManagementModal };
