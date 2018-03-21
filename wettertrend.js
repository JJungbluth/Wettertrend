$(document).ready(() => {
    console.log("hello world");
    // var promiseArray = [];
    // promiseArray.push(requestCurrentTemp());
    // promiseArray.push(requestTempTrend());
    loadTemps();
});

function loadTemps() {
    $.when(requestCurrentTemp(), requestTempTrend()).then(function (currentTemp, tempTrend) {
        console.log("CurrentTemp: " + currentTemp);
        console.log("Trend temps: " + tempTrend);
        setTrendClass(currentTemp, tempTrend);
    });
}

function requestCurrentTemp() {
    var deferred = jQuery.Deferred();
    console.log("Getting current temp");
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=Trier,de&APPID=ee595a2e51b9aa75efcfd4297fb55b8c", success: function (result) {
            console.log('Success getting current weather');
            console.log(result);
            var temp = kelvinInCelsius(result.main.temp).toFixed(1);
            // console.log(temp);
            $('#currentWeatherResult').text(temp + '°C');
            deferred.resolve(temp);
        }, error: function (error) {
            console.error('Failed to get current temp');
            console.error(error);
            $('#errorMessage').show();
            deferred.reject();
        }
    });
    return deferred.promise();
}

function requestTempTrend() {
    var deferred = jQuery.Deferred();
    console.log("Getting temp trend");
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q=Trier,de&APPID=ee595a2e51b9aa75efcfd4297fb55b8c", success: function (result) {
            console.log('Success getting weather trend');
            console.log(result);
            var currentHour = new Date().getHours();
            console.log("Current Hour: " + currentHour);
            var forecastResults = [];
            for (const element of result.list) {
                if (new Date(element.dt_txt).getHours() >= currentHour - 1 && new Date(element.dt_txt).getHours() <= currentHour + 1) {
                    // skip all nodes that are not around current our => 1 each day at about the same time
                    forecastResults.push(element);
                }
            }
            // Result control
            if (forecastResults.length != 5) {
                console.warn("Not exaclty 5 resutls");
            }
            // Prepare list of result divs
            var forecastResultOutputs = $('.forecastResult');
            if (forecastResultOutputs.length != 5) {
                console.warn('Did not find exactly 5 output divs');
            }
            // Results processing
            $(forecastResultOutputs).each(function (index) {
                $(this).text(kelvinInCelsius(forecastResults[index].main.temp).toFixed(1) + '°C');
                // Update ForecastResult to only contain temperature in °C
                forecastResults[index] = kelvinInCelsius(forecastResults[index].main.temp).toFixed(1);
            });
            deferred.resolve(forecastResults);
        }, error: function (error) {
            console.error('Failed to get Weather trend');
            console.error(error);
            $('#errorMessage').show();
            deferred.reject();
        }
    });
    return deferred.promise();
}

function setTrendClass(currentTemp, trendTemp) {
    var trendElements = $('.forecastResult');
    $(trendElements).each(function (index) {
        if (currentTemp < trendTemp[index]) {
            $(this).addClass('hotter');
            $(this).append('<span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>')
        }
        else {
            $(this).addClass('colder');
            $(this).append('<span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>')
        }
    })
}

function kelvinInCelsius(tempK) {
    return tempK - 273;
}

function handleReloadClicked() {
    console.log("reload");
    loadTemps();
}

// http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID={APIKEY}