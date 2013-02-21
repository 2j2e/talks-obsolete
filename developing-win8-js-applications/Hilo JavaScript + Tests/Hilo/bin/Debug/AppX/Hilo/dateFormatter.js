// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // This module makes use of the WinRT API
    // ` Windows.Globalization.DateTimeFormatting.DateTimeFormatter`
    //
    // See the official documentation here:
    // http://msdn.microsoft.com/en-us/library/windows/apps/windows.globalization.datetimeformatting.datetimeformatter.aspx

    // Imports And Constants
    // ---------------------
    var global = Windows.Globalization,
        format = Windows.Globalization.DateTimeFormatting,
        globalizationPreferences = Windows.System.UserProfile.GlobalizationPreferences;

    // Construct a calendar that we can use for formatting dates.
    var resolvedCalendar = new global.Calendar();

    // Instatiate a throw-away instance of `DateTimeFormatter`
    // just so we can acquire the geographic region in order 
    // to construct a another `DateTimeFormatter` with all of 
    // the appropriate values.
    var geographicRegion = new format.DateTimeFormatter("shortdate").resolvedGeographicRegion;

    // Construct a `DateTimeFormatter` that will _only_ return the full month.
    var monthFormatter = new format.DateTimeFormatter(
        format.YearFormat.none,
        format.MonthFormat.full,
        format.DayFormat.none,
        format.DayOfWeekFormat.none,
        format.HourFormat.none,
        format.MinuteFormat.none,
        format.SecondFormat.none,
        globalizationPreferences.languages,
        geographicRegion,
        resolvedCalendar.getCalendarSystem(),
        resolvedCalendar.getClock()
        );

    // Construct a `DateTimeFormatter` that will _only_ return an abbreviated month.
    var abbreviatedMonthFormatter = new format.DateTimeFormatter(
        format.YearFormat.none,
        format.MonthFormat.abbreviated,
        format.DayFormat.none,
        format.DayOfWeekFormat.none,
        format.HourFormat.none,
        format.MinuteFormat.none,
        format.SecondFormat.none,
        globalizationPreferences.languages,
        geographicRegion,
        resolvedCalendar.getCalendarSystem(),
        resolvedCalendar.getClock()
        );

    // Construct a `DateTimeFormatter` that will _only_ return the full year.
    var yearFormatter = new format.DateTimeFormatter(
        format.YearFormat.full,
        format.MonthFormat.none,
        format.DayFormat.none,
        format.DayOfWeekFormat.none,
        format.HourFormat.none,
        format.MinuteFormat.none,
        format.SecondFormat.none,
        globalizationPreferences.languages,
        geographicRegion,
        resolvedCalendar.getCalendarSystem(),
        resolvedCalendar.getClock()
        );

    // Private Methods
    // ---------------

    function getMonthFrom(date) {
        return monthFormatter.format(date);
    }

    function getAbbreviatedMonthFrom(date) {
        return abbreviatedMonthFormatter.format(date);
    }

    function getYearFrom(date) {
        return yearFormatter.format(date);
    }

    function getISO8601WithoutMilliseconds(date) {
        var isoDate = date.toISOString();
        return isoDate.replace(/\.\d\d\dZ$/, "Z");
    }

    function calendarFor(year, month) {
        var calendar = new global.Calendar();

        // In JavaScript, the first month is 0. 
        month = month + 1;

        calendar.year = year;
        calendar.month = month;
        return calendar;
    }

    function startOfMonthAsISO8601(calendar) {
        calendar.day = calendar.firstDayInThisMonth;
        calendar.period = calendar.firstPeriodInThisDay;
        calendar.hour = calendar.firstHourInThisPeriod;
        calendar.minute = calendar.firstMinuteInThisHour;
        calendar.second = calendar.firstSecondInThisMinute;

        return getISO8601WithoutMilliseconds(calendar.getDateTime());
    }

    function endOfMonthAsISO8601(calendar) {
        calendar.day = calendar.lastDayInThisMonth;
        calendar.period = calendar.lastPeriodInThisDay;
        calendar.hour = calendar.lastHourInThisPeriod;
        calendar.minute = calendar.lastMinuteInThisHour;
        calendar.second = calendar.lastSecondInThisMinute;

        return getISO8601WithoutMilliseconds(calendar.getDateTime());
    }

    function createFilterRangeFromYearAndMonth(year, month) {
        var calendar = calendarFor(year, month);

        var startOfRange = startOfMonthAsISO8601(calendar);
        var endOfRange = endOfMonthAsISO8601(calendar);

        return "System.ItemDate:" + startOfRange + ".." + endOfRange;
    }

    function createFilterFromYearAndMonth(year, month) {
        var calendar = calendarFor(year, month);

        var startOfRange = startOfMonthAsISO8601(calendar);

        return "System.ItemDate:" + startOfRange;
    }

    function createFilterFromDate(date) {
        return createFilterFromYearAndMonth(date.getFullUTCYear(), date.getUTCMonth());
    }

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo.dateFormatter", {
        getMonthFrom: getMonthFrom,
        getAbbreviatedMonthFrom: getAbbreviatedMonthFrom,
        getYearFrom: getYearFrom,
        createFilterFromDate: createFilterFromDate,
        createFilterFromYearAndMonth: createFilterFromYearAndMonth,
        createFilterRangeFromYearAndMonth: createFilterRangeFromYearAndMonth
    });

}());
