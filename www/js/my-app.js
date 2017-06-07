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
            fd.append('image', imageData);

            toDataURL(
                'https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0',
                function (dataUrl) {
                    watermark = dataUrl;
                    deferred.resolve();
                },
                'image/jpeg'
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

                        myApp.alert(JSON.stringify(data));
                        console.log(data);
                    },
                    error: function (data) {
                        myApp.alert(JSON.stringify(data));
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