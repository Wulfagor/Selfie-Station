window.data_of_user = {
    'name': null,
    'email': null,
    'agree_photo': null,
    'agree_data_of_user': null
};
//window.db = window.openDatabase('selfie_station', '1.0', 'selfie_station', 50 * 1024 * 1024);
window.db = null;
window.previous_page_name = null;

// Initialize app
var myApp = new Framework7({
    modalTitle: 'Selfie Station',
    cache: false,
    pushState: true,
    routerRemoveWithTimeout: true,
    onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
});
var storage = window.localStorage;
var $$ = Dom7;
var mainView = myApp.addView('.view-main');

var IScroll = new IScroll('.views');

$$(document).on('deviceready', function () {
    central_block();
    //window.db = window.openDatabase('selfie_station', '1.0', 'selfie_station', 50 * 1024 * 1024, onSuccess);
    db = window.sqlitePlugin.openDatabase({name: 'selfie_station.db', location: 'default'});
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS DATA', [], onSuccess, onError);
        tx.executeSql('CREATE TABLE IF NOT EXISTS DATA (name TEXT, data TEXT)', [], onSuccess, onError);
    });

    function onSuccess(transaction, resultSet) {
        //myApp.alert('Query completed: ' + JSON.stringify(resultSet));
        //console.log('Query completed: ' + JSON.stringify(resultSet));
    }

    function onError(transaction, error) {
        myApp.alert('Query failed: ' + error.message);
        console.log('Query failed: ' + error.message);
    }
});

$$(document).on('pageInit', '*', function (e) {
    if (e.detail.page.name !== 'index' && e.detail.page.name !== 'agree_text') {
        check_data_of_user();
    }
    central_block();
});

$$(document).on('pageInit', '.page[data-page="index"]', function (e) {

    central_block();
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS DATA', [], onSuccess, onError);
        tx.executeSql('CREATE TABLE IF NOT EXISTS DATA (name TEXT, data TEXT)', [], onSuccess, onError);
    });

    function onSuccess(transaction, resultSet) {
        //myApp.alert('Query completed: ' + JSON.stringify(resultSet));
        //console.log('Query completed: ' + JSON.stringify(resultSet));
    }

    function onError(transaction, error) {
        myApp.alert('Query failed: ' + error.message);
        console.log('Query failed: ' + error.message);
    }
});

$$(document).on('pageInit', '.page[data-page="hello_page"]', function (e) {
    if (data_of_user.name !== null || (typeof data_of_user.name !== 'undefined') || data_of_user.name != '') {
        $("#username").html(data_of_user.name);
    }
});

$$(document).on('pageInit', '.page[data-page="camera"]', function (e) {
    if (!navigator.camera) {
        myApp.alert('Camera not supported!');
    } else {
        navigator.camera.getPicture(onSuccessCamera, onFailCamera,
            {
                quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                allowEdit: false,
                sourceType: 1,
                encodingType: 0,
                cameraDirection: 1
            }
        );

        function onSuccessCamera(imageData) {
            $("#photo_background").css({
                'background': "url(data:image/jpeg;base64," + imageData + ") center center no-repeat",
                'background-size': 'cover'
            });

            db.transaction(function (tx) {
                tx.executeSql('INSERT INTO DATA (name, data) VALUES (?, ?)', ["selfie", imageData], onSuccess, onError);
            });

            function onSuccess(transaction, resultSet) {
                //myApp.alert('Query completed: ' + JSON.stringify(resultSet));
                //console.log('Query completed: ' + JSON.stringify(resultSet));
            }

            function onError(transaction, error) {
                close_application();
                myApp.alert('Query failed: ' + error.message);
                console.log('Query failed: ' + error.message);
            }
        }

        function onFailCamera(message) {
            myApp.alert('Failed because: ' + message);
        }
    }
});

$$(document).on('pageInit', '.page[data-page="camera_success"]', function (e) {

    if (!navigator.camera) {
        myApp.alert('Camera not supported!');
    } else {
        navigator.camera.getPicture(onSuccessCamera, onFailCamera,
            {
                quality: 90,
                destinationType: Camera.DestinationType.DATA_URL,
                allowEdit: false,
                sourceType: 1,
                encodingType: 0,
                cameraDirection: 1,
                targetWidth: 1024,
                targetHeight: 1024
            }
        );

        function onSuccessCamera(imageData) {

            var deferred = $.Deferred();
            var watermark = '';
            var fd = new FormData();
            fd.append('image', 'data:image/jpeg;base64,' + imageData);
            //fd.append('image', 'data:image/jpeg;base64,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');

            toDataURL(
                '/images/watermark.png',
                function (dataUrl) {
                    watermark = dataUrl;
                    deferred.resolve();
                },
                'image/png'
            );

            $.when(deferred).done(function () {
                fd.append('watermark', watermark);

                $.ajax({
                    url: 'http://50anni.cosmeticaitalia.it/wp-json/api/selfie/add_watermark',
                    data: fd,
                    processData: false,
                    contentType: false,
                    async: false,
                    cache: false,
                    method: 'POST',
                    success: function (data) {

                        $("#photo").css({
                            'background': "url(data:image/jpeg;base64," + data + ") center center no-repeat",
                            'background-size': 'contain'
                        });

                        db.transaction(function (tx) {
                            tx.executeSql('INSERT INTO DATA (name, data) VALUES (?, ?)', ["selfie", data], onSuccess, onError);
                        });

                        //myApp.alert(JSON.stringify(data));
                        console.log(data);
                    },
                    error: function (data) {
                        //myApp.alert(JSON.stringify(data));
                        console.log(data);
                    }
                });
            });

            return true;

            $("#photo").css({
                'background': "url(data:image/jpeg;base64," + imageData + ") center center no-repeat",
                'background-size': 'contain'
            });

            db.transaction(function (tx) {
                tx.executeSql('INSERT INTO DATA (name, data) VALUES (?, ?)', ["selfie", imageData], onSuccess, onError);
            });

            function onSuccess(transaction, resultSet) {
                //myApp.alert('Query completed: ' + JSON.stringify(resultSet));
                //console.log('Query completed: ' + JSON.stringify(resultSet));
            }

            function onError(transaction, error) {
                close_application();
                myApp.alert('Query failed: ' + error.message);
                console.log('Query failed: ' + error.message);
            }
        }

        function onFailCamera(message) {
            myApp.alert('Failed because: ' + message);
        }
    }

    /*
     db.transaction(function (tx) {
     tx.executeSql('SELECT * FROM DATA WHERE name=?', ["selfie"], function (tx, results) {
     //myApp.alert('Success - ' + JSON.stringify(results));
     var len = results.rows.length, i;
     if (len > 0) {
     var selfie_temp = results.rows.item(0).data;
     if (selfie_temp !== null || (typeof selfie_temp !== 'undefined') || selfie_temp !== '') {
     $("#photo").css({
     'background': "url(data:image/jpeg;base64," + selfie_temp + ") center center no-repeat",
     'background-size': 'contain'
     });
     }
     }
     }, function (error) {
     myApp.alert('Error - ' + JSON.stringify(error));
     console.log(error);
     });
     });
     */
});

$$(document).on('pageInit', '.page[data-page="thank_you"]', function (e) {
    var countdown = 15;

    var timerId = setInterval(function () {
        $("#thank_you_countdown_block #countdown").text(countdown);
        countdown--;
    }, 1000);

    setTimeout(function () {
        clearInterval(timerId);
        close_application();
    }, 16000);


    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM DATA WHERE name=?', ["selfie"], function (tx, results) {
            var len = results.rows.length, i;
            if (len > 0) {
                var selfie_temp = results.rows.item(0).data;
                if (selfie_temp !== null || (typeof selfie_temp !== 'undefined') || selfie_temp !== '') {
                    var fd = new FormData();

                    if (data_of_user.agree_data_of_user == 'agree_data_of_user') {
                        fd.append('name', data_of_user.name);
                        fd.append('email', data_of_user.email);
                    } else {
                        fd.append('name', null);
                        fd.append('email', null);
                    }

                    fd.append('selfie', "data:image/jpeg;base64," + selfie_temp);

                    $.ajax({
                        url: 'http://50anni.cosmeticaitalia.it/wp-json/api/selfie/new_str',
                        data: fd,
                        processData: false,
                        contentType: false,
                        async: false,
                        cache: false,
                        method: 'POST',
                        success: function (data) {
                            //myApp.alert(JSON.stringify(data));
                            //console.log(data);
                        },
                        error: function (data) {
                            //myApp.alert(JSON.stringify(data));
                            //console.log(data);
                        }
                    });
                }
            }
        }, null);
    });
});

function check_data_of_user() {
    console.log('check_data_of_user');
    data_of_user.name = storage.getItem('name');
    data_of_user.email = storage.getItem('email');
    data_of_user.agree_photo = storage.getItem('agree_photo');
    data_of_user.agree_data_of_user = storage.getItem('agree_data_of_user');
    var check = 1;

    $.each(data_of_user, function (key, value) {

        switch (value) {
            case "name":
                if (value === null || (typeof value === 'undefined') || value == '') {
                    check = 0;
                }
                break;
            case "email":
                if (value === null || (typeof value === 'undefined') || value == '')
                    check = 0;
                break;
            case "agree_data_of_user":
                break;
            case "agree_photo":
                if (value != 'agree_photo')
                    check = 0;
                break;
        }
    });

    if (check)
        return true;
    else
        return back_to_page('index.html');
}

function central_block() {
    var height_block = $(".content_block_inner").height();
    var height_window = $(window).height();
    if ((height_block !== null || (typeof height_block !== 'undefined') || height_block != '') && (height_window !== null || (typeof height_window !== 'undefined') || height_window != '')) {

        if (height_window > height_block) {
            $(".content_block_inner").css({
                'margin-top': (height_window - height_block) / 2 + "px"
            });
        }

        setTimeout(function () {
            $(".content_block_inner").addClass('show');
        }, 200);
    }
}

function redirect_to_page(page_name) {
    console.log('redirect_to_page - ' + page_name);
    //set previous page name
    window.previous_page_name = mainView.activePage.name;
    setTimeout(function () {
        return mainView.router.load({
            url: page_name,
            reload: true,
            ignoreCache: true
        });
    }, 500);
}

function back_to_page(page_name) {
    console.log('back_to_page - ' + page_name);
    //set previous page name
    window.previous_page_name = mainView.activePage.name;
    setTimeout(function () {
        return mainView.router.back({
            url: page_name,
            force: true,
            reload: true,
            ignoreCache: true
        });
    }, 500);
}

function back_to_previous_page() {
    console.log('back_to_previous_page');
    if (window.previous_page_name !== null || (typeof window.previous_page_name !== 'undefined') || window.previous_page_name != '') {
        setTimeout(function () {
            return mainView.router.load({
                url: window.previous_page_name + '.html',
                reload: true,
                ignoreCache: true,
            });
        }, 500);
    } else {
        setTimeout(function () {
            return mainView.router.load({
                url: 'index.html',
                reload: true,
                ignoreCache: true,
            });
        }, 500);
    }
}

function process_form() {
    var storedData = $('#main_form').serializeArray();
    var error = 0;
    var error_agree = 1;
    if (storedData) {
        $.each(storedData, function (key, value) {

            data_of_user[value['name']] = value['value'];

            switch (value['name']) {
                case "name":
                    if (value['value'] === null || (typeof value['value'] === 'undefined') || value['value'] == '') {
                        error = 1;
                    }
                    break;
                case "email":
                    if (value['value'] === null || (typeof value['value'] === 'undefined') || value['value'] == '') {
                        error = 1;
                    } else {
                        if (!isEmail(value['value']))
                            error = 1;
                    }
                    break;
                case "agree_data_of_user":
                    break;
                case "agree_photo":
                    if (value['value'] == 'agree_photo')
                        error_agree = 0;
                    break;
            }

            storage.setItem(value['name'], value['value']);
        });

        if (error || error_agree) {
            myApp.alert('È necessario compilare tutti i campi!');
            return false;
        }
        else
            return redirect_to_page('hello_page.html');
    } else
        close_application();

    return false;
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function close_application() {
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS DATA', [], function (tx, result) {
            $.each(data_of_user, function (key, value) {
                storage.removeItem(key);
            });
            data_of_user = {
                'name': null,
                'email': null,
                'agree_photo': null,
                'agree_data_of_user': null
            };
            back_to_page('index.html');
        }, function (error) {
            myApp.alert('Data Base Error: Can not drop a table');
            $.each(data_of_user, function (key, value) {
                storage.removeItem(key);
            });
            data_of_user = {
                'name': null,
                'email': null,
                'agree_photo': null,
                'agree_data_of_user': null
            };
            back_to_page('index.html');
        });
    });
}

function camera_reload() {
    return mainView.router.refreshPage();
}

function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}