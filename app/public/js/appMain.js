const ipcRenderer = require('electron').ipcRenderer;
const clipboard = require('electron').clipboard;
var myapp = angular.module('myapp', ['ngRoute']);
var shell = require('electron').shell;
var paginate_start = 5;

// get recent posts for sidebar menu
//ipcRenderer.send('getRecents', '');

// get recent posts for sidebar menu
console.log('---------------------------appMain.js  getMenus before');

ipcRenderer.send('getMenus');

// configure our routes
myapp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'homeController'
        })

        .when('/edit/:doc_id', {
            templateUrl: 'views/edit.html',
            controller: 'editController'
        })
        .when('/editMenu/:doc_id', {
            templateUrl: 'views/editMenu.html',
            controller: 'editMenuController'
        })

        .when('/new', {
            templateUrl: 'views/new.html',
            controller: 'newController'
        })
        .when('/newmenu', {
            templateUrl: 'views/newmenu.html',
            controller: 'newmenuController'
        })

        .when('/view/:doc_id', {
            templateUrl: 'views/view.html',
            controller: 'viewController'
        })

        .when('/viewMenu/:doc_id', {
            templateUrl: 'views/viewMenu.html',
            controller: 'viewMenuController'
        });
});

// open all links externally in default browser
$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

// The home route showing latest posts
myapp.controller('homeController', function ($scope, $route, $timeout) {
    // on going home we reset the pagination
    paginate_start = 5;

    // get the posts on load if nothing showing
    if ($(".mainBody").html() == undefined || $(".mainBody").html().trim() == "") {
        ipcRenderer.send('getPosts', { 'limit': 5, 'caller': 'gotPosts' }); // get 5 posts
    }

    // when home links are clicked we reload to get the latest posts
    $(".go_home").click(function () {
        $route.reload();
    });

    // document is ready
    $timeout(function () {
        // add responsive image class
        $("img").addClass("img-responsive");

        // hook up go_new button
        $(".go_new").click(function () {
            window.location.href = "#new";
        });
    });
});

// view an individual post
myapp.controller('viewController', function ($scope, $routeParams, $timeout) {
    // set up the args for the query
    var args = {};
    args.doc_id = $routeParams.doc_id;
    args.caller = 'gotOneView';

    // send message to get the single post to view
    ipcRenderer.send('getOne', args);

    // add img-responsive class
    $timeout(function () {
        $("img").addClass("img-responsive");
    });
});

// view an individual post
myapp.controller('viewMenuController', function ($scope, $routeParams, $timeout) {
    // set up the args for the query
    console.log('-----------:viewMenu');
});

// edit an existing post
myapp.controller('editController', function ($scope, $routeParams, $timeout) {
    addEditorPreview();
    console.log('enter editpostController ----------------');
    // set up the args for the query
    var args = {};
    args.doc_id = $routeParams.doc_id;
    args.caller = 'gotOneEdit';
    ipcRenderer.send('getOne', args);

    // add img-responsive class
    // $timeout(function(){
    //     $("img").addClass("img-responsive");
    // });

    $("#btnPostSave").click(function () {
        if ($("#editor").val().length > 5) {
            // construct the update doc
            var doc = {};
            doc.post_body = $("#editor").val();
            doc._id = $routeParams.doc_id;
            doc.post_date = Date.now();
            doc.pid = $("#pid").val();
            doc.deepth = $("#deepth").val();
            doc.type = "0";

            console.log(doc._id)
            // send the update message
            ipcRenderer.send('updateQuery', doc);

            // Update the recent docs
            console.log('---------------------------appMain.js  editController btnPostSave  getMenus');

            ipcRenderer.send('getMenus');
        } else {
            show_notification("Please enter some content", "danger");
        }
    });

    $("#btnPostDelete").click(function () {
        // send the delete command. A confirm dialog is shown from the main
        ipcRenderer.send('deletePost', { 'doc_id': $routeParams.doc_id });
    });

    $("#btnPostPaste").click(function () {
        // send the delete command. A confirm dialog is shown from the main
        ipcRenderer.send('writeImage', '');
    });
});


// edit an existing menu
myapp.controller('editMenuController', function ($scope, $routeParams, $timeout) {
    addMenuEditorPreview();

    // set up the args for the query
    console.log('editmenuController ----------------');
    var args = {};
    args.doc_id = $routeParams.doc_id;
    args.caller = 'gotOneEdit';
    ipcRenderer.send('getOne', args);

    // add img-responsive class
    // $timeout(function(){
    //     $("img").addClass("img-responsive");
    // });

    $("#btnMenuSave").click(function () {
        if ($("#editor").val().length > 2) {
            // construct the update doc
            var doc = {};
            doc.post_body = $("#editor").val();
            doc._id = $routeParams.doc_id;
            doc.post_date = Date.now();
            doc.pid = $("#pid").val();
            doc.type = "1";
            console.log(doc._id)
            // send the update message
            ipcRenderer.send('updateQuery', doc);

            // Update the recent docs
            console.log('---------------------------appMain.js  editMenuController btnMenuSave  getMenus');

            ipcRenderer.send('getMenus');
        } else {
            show_notification("Please enter some content", "danger");
        }
    });

    $("#btnPostDelete").click(function () {
        // send the delete command. A confirm dialog is shown from the main
        ipcRenderer.send('deletePost', { 'doc_id': $routeParams.doc_id });
    });

    $("#btnPostPaste").click(function () {
        // send the delete command. A confirm dialog is shown from the main
        ipcRenderer.send('writeImage', '');
    });
});

// new post
myapp.controller('newController', function ($scope, $timeout) {
    addEditorPreview();
    // add img-responsive class
    $timeout(function () {
        $("img").addClass("img-responsive");
    });

    $("#btnPostInsert").click(function () {
        if ($("#editor").val().length > 2) {
            var doc = {};
            doc.post_body = $("#editor").val();
            doc.post_date = Date.now();
            doc.pid = $("#pid").val();
            doc.deepth = $("#deepth").val();
            doc.type = "0";
            // send the insert message
            ipcRenderer.send('insertQuery', doc);

            // Update the recent docs
            console.log('---------------------------appMain.js  newController btnPostInsert  getMenus');

            ipcRenderer.send('getMenus');
        } else {
            show_notification("Please enter some content", "danger");
        }
    });

    $("#btnPostPaste").click(function () {
        // send the delete command. A confirm dialog is shown from the main
        ipcRenderer.send('writeImage', '');
    });
});

// new menu
myapp.controller('newmenuController', function ($scope, $timeout) {
    //addEditorPreview();
    $("#btnMenuInsert").click(function () {
        if ($("#editor").val().length > 2 && $("#pid").val().length > 0) {
            var doc = {};
            doc.post_body = $("#editor").val();
            doc.pid = $("#pid").val();
            doc.type = "1";
            doc.post_date = Date.now();

            // send the insert message
            ipcRenderer.send('insertQuery', doc);

            // Update the recent docs  第几层的目录就更新第几层的
            console.log('---------------------------appMain.js  newmenuController btnPostInsert  getMenus');

            ipcRenderer.send('getMenus');
        } else {
            show_notification("Please enter some content", "danger");
        }
    });
});

// EVENT LISTENERS //

// return of queryPosts
ipcRenderer.on('gotSearch', function (event, data) {
    $(".mainBody").empty();

    if (data.length == 0) {
        var html = "<h3 class='text-center'>No posts found.</h3>";
        $(".mainBody").html(html);
    } else {
        // keep the seach term
        var search_term = $('#SearchTerm').val();

        // clear the search box
        $('#SearchTerm').val('');

        // show the search term
        $(".mainBody").html("<h3 class='text-center'>Search results for: " + search_term + "</h3>");

        // loop the data and display it
        $.each(data, function (key, value) {
            var post_html = render_post(value);
            $(".mainBody").append(post_html);
        });
    }
});

// return of getImage
ipcRenderer.on('gotImage', function (event, data) {
    if (data != "") {
        var caretPos = document.getElementById("editor").selectionStart;
        var textAreaTxt = $("#editor").val();
        var txtToAdd = '![alt text](' + data + ' "Title Text")\n';
        $("#editor").val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos));
        $("#editor").focus();
        addEditorPreview();
    }
});

// return of getPosts
ipcRenderer.on('gotPosts', function (event, data) {
    $(".mainBody").empty();
    if (data.length == 0) {
        var html = "<h2 class='no-posts text-center'>No posts...</h2>";
        html += "<p class='text-center'><a href='#new' class='go_new btn btn-success'>Lets get started...</a></p>";
        $(".mainBody").html(html);
    } else {
        // loop the data and display it
        $.each(data, function (key, value) {
            var post_html = render_post(value);
            $(".mainBody").append(post_html);
        });

        var post_count = ipcRenderer.sendSync('getPostCount');
        var more_posts = post_count > paginate_start ? "" : "disabled='disabled'";

        $(".mainBody").append("<div class='col-sm-12 text-center'><button id='get_more' class='btn btn-warning' " + more_posts + " onclick='get_more_posts()'>Get more posts</button></div>");
    }
});

// return of cleanUpImages
ipcRenderer.on('cleanUpImagesComplete', function (event, data) {
    show_notification("All unused image files have been deleted", "success");
});

// return of backupData
ipcRenderer.on('backupDataComplete', function (event, data) {
    show_notification("Backup data is here: " + data, "success", 5000);
});

// return of getPosts
ipcRenderer.on('gotMorePosts', function (event, data) {
    paginate_start = paginate_start + data.length;

    // remove the get more
    $("#get_more").remove();

    // loop the data results and append the posts
    $.each(data, function (key, value) {
        var post_html = render_post(value);
        $(".mainBody").append(post_html);
    });

    var post_count = ipcRenderer.sendSync('getPostCount');
    var more_posts = post_count > paginate_start ? "" : "disabled='disabled'";

    // append get more
    $(".mainBody").append("<div class='col-sm-12 text-center'><button id='get_more' class='btn btn-warning' " + more_posts + " onclick='get_more_posts()'>Get more posts</button></div>");
});

// return of deletePost
ipcRenderer.on('postDeleted', function (event, data) {
    if (data == true) {
        show_notification("Post successfully deleted", "success");
        setInterval(function () {
            // Update the recent docs
            ipcRenderer.send('getRecents', '');

            // redirect home
            window.location.href = "#";
        }, 2500);
    } else {
        show_notification("Post not deleted", "danger");
        setInterval(function () {
            location.reload();
        }, 2500);
    }
});


// return of getOne
ipcRenderer.on('gotOneView', function (event, data) {
    if (data) {
        $(".mainBody").empty();
        var post_html = render_post(data);
        $(".mainBody").append(post_html);
    } else {
        show_notification("Post could not be found", "danger");
    }
});

// return of getOne
ipcRenderer.on('gotOneEdit', function (event, data) {
    if (data) {
        var mark_it_down = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true });
        var html = mark_it_down.render(data.post_body);
        $("#editor").val(data.post_body);
        $("#pid").val(data.pid);
        $("#deepth").val(data.deepth);
        $("#preview").html(html);
    } else {
        show_notification("Post could not be found", "danger");
    }
});

// return of updateQuery
ipcRenderer.on('docUpdated', function (event, result) {
    if (result == true) {
        show_notification("Successfully updated", "success");
    } else {
        show_notification("Failed to update post. Please try again.", "danger");
    }
});

// return of insertQuery
ipcRenderer.on('docInserted', function (event, data) {
    if (data.result == true) {
        show_notification("Successfully inserted", "success");
        setTimeout(function () {
            //alert("Done" + data._id); 
            window.location = "#edit/" + data._id;
        }, 1200);
    } else {
        show_notification("Failed to insert post. Please try again.", "danger");
    }
});

// return of getRecents
ipcRenderer.on('gotRecents', function (event, data) {
    // empty sidebar
    $('.sidebar').empty();

    // add heading
    var html = '<li class="list-group-item list-group-item-danger">Recent posts</li>';
    $('.sidebar').append(html);

    // no posts so we add a no recent posts item
    if (data.length == 0) {
        $('.sidebar').append('<li class="list-group-item">No recent posts</li>');
    } else {
        // add recent posts
        $.each(data, function (key, value) {
            var mark_it_down = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true });
            var body_html = mark_it_down.render(value.post_body);
            var first_line = body_html.split('\n')[0];
            var stripped = strip_tags(first_line);
            var html = '<li class="list-group-item"><i class="fa fa-chevron-right"></i>&nbsp;&nbsp;<a href="#view/' + value._id + '">' + stripped.substring(0, 20) + '</a></li>';
            $('.sidebar').append(html);
        });
    }
});

// return of getMenus
ipcRenderer.on('gotMenus', function (event, dataV) {
    console.log('---------------------------appMain.js ipcRenderer.on gotMenus');

    // empty sidebar
    $('.sidebar').empty();

    // add heading
    var html = '<li class="list-group-item list-group-item-danger">Menu</li>';
    $('.sidebar').append(html);

    // no posts so we add a no recent posts item
    console.log(dataV.length)
    if (dataV.length == 0) {
        $('.sidebar').append('<li class="list-group-item">No Menus</li>');
    } else {
        // add recent posts
        var data1 = [];
        $.each(dataV, function (key, value) {
            var one = {};
            var viewStr = "view/";
            if (value.type == "1") {
                viewStr = "viewMenu/"
            }
            var mark_it_down = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true });
            var name = mark_it_down.render(value.post_body);
            var first_line = name.split('\n')[0];
            var stripped = strip_tags(first_line);
            var html = '<li class="list-group-item"><i class="fa fa-chevron-right"></i>&nbsp;&nbsp;<a href="#' + viewStr + value._id + '">' + stripped.substring(0, 20) + '</a></li>';
            //$('.sidebar').append(html);

            one['type'] = value.type;
            one['pgid'] = value.pid;
            one['name'] = stripped.substring(0, 20);
            one['id'] = value._id;
            data1.push(one);
            //console.log(JSON.stringify(one));

        });

        //var data1=[{"id":"36","name":"123","type":"product","pgid":"0"},{"id":"37","name":"124","type":"product","pgid":"36"}];
        $('#browser').empty();
        $('#browser').showTree({
            data: data1, bindings: {
                'pg_add': {
                    val: '新建子层文档',
                    ismy: 1,
                    cb: function (t) {
                        alert('add  ' + t.id + '  name:' + t.innerHTML + '    t.type:' + t.getAttribute('type') );
                        var el = document.getElementById('newpost');

                        el.click();//触发打开事件
                    }
                },
                'pg_addmenu': {
                    val: '新建自文件夹',
                    ismy: 1,
                    cb: function (t) {
                        alert('add  ' + t.id + '  name:' + t.innerHTML + '    t.type:' + t.getAttribute('type') );
                        var el = document.getElementById('newmenu');

                        //el.target = '_new'; //指定在新窗口打开
                        el.click();//触发打开事件
                        document.getElementById('pid').value=t.id;
                    }
                },
                'pg_delete': {
                    val: '删除',
                    ismy: 1,
                    cb: function (t) {
                        alert('del  ' + t.id + '  name:' + t.innerHTML);
                    }
                },
                'pg_update': {
                    val: '重命名',
                    ismy: 1,
                    cb: function (t) {
                        alert('edit  ' + t.id + '  name:' + t.innerHTML);
                    }
                }


            }, callback: function (t) {
                alert('click  ' + t.id + '  name:' + t.innerHTML + '    t.type:' + t.getAttribute('type'));
                console.log(JSON.stringify(t));
                console.log(simpleStringify(this));
            }
        });

    }
});

function simpleStringify(object) {
    var simpleObject = {};
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof (object[prop]) == 'object') {
            continue;
        }
        if (typeof (object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};
// EVENT LISTENERS //

// FUNCTIONS //
function cleanImages() {
    ipcRenderer.send('cleanUpImages');
}

function backupData() {
    ipcRenderer.send('backupData');
}

// fire off the search
function post_search() {
    window.location.href = "#";
    ipcRenderer.send('queryPosts', { 'search_term': $('#SearchTerm').val() });
}

function get_more_posts() {
    // retrieves more posts. Basically some pagination
    ipcRenderer.send('getPosts', { 'start': paginate_start, 'limit': 5, 'caller': 'gotMorePosts' });
}

// render the post body
function render_post(post) {
    // writes out the post html
    var editStr = "edit";
    if (post.type == "1") {
        editStr = "editMenu";
        console.log('---------------render -menu');
    } else {
        console.log('--------------render --post');
    }
    var html = "<div class='post_header_row col-sm-12 col-md-12 col-lg-12'>";
    html += "<span class='text-muted pull-left'>" + moment(post.post_date).format("dddd, MMMM Do YYYY h:mma") + "</span>";
    html += "<a class='pull-right' href='#" + editStr + "/" + post._id + "'><i class='icon_pad fa fa-pencil'></i></a>";
    html += "<a class='pull-right' href='#view/" + post._id + "'><i class='icon_pad fa fa-eye'></i></a>";
    html += "</div>";
    html += "<div class='post_body_row col-sm-12 col-md-12 col-lg-12'>";
    html += convertMarkdown(post.post_body);
    html += "</div>";
    html += "<div class='post_footer_row col-sm-12 col-md-12 col-lg-12'>";
    html += "";
    html += "</div>";

    return html;
}

// strips the html tags from a string
function strip_tags(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}

// links up the preview div to live update from the editor textarea
function addEditorPreview() {
    var convertTextAreaToMarkdown = function () {
        var mark_it_down = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true });
        var text = $('#editor').val();
        var html = mark_it_down.render(text);
        $('#preview').html(html);
    }

    // on input change, call the function to convert
    // $('#editor').on("input", function() {
    //     convertTextAreaToMarkdown();
    // });

    convertTextAreaToMarkdown();
    $("img").addClass("img-responsive");
}

// links up the preview div to live update from the editor textarea
function addMenuEditorPreview() {

}

// converts markdown string to html
function convertMarkdown(text) {
    var mark_it_down = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true });
    var html = mark_it_down.render(text);
    $("img").addClass("img-responsive");
    return html;
}

// show notification popup
function show_notification(msg, type, timeout) {
    timeout = timeout || 20;

    $("#notify_message").removeClass();
    $("#notify_message").addClass('notify_message-' + type);
    $("#notify_message").html(msg);
    $('#notify_message').slideDown(600).slideUp(600);
}

// FUNCTIONS //