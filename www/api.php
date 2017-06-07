<?php

/**
 * Get available years from Anni50 Options
 * @return bool|mixed
 */
function api_years()
{
    $years = get_field("available_years", 7);
    return $years;
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/years', array(
        'methods' => 'GET',
        'callback' => 'api_years',
    ));
});


/**
 * Get all comments
 * @return array|int
 */
function api_comments()
{

    $offset = (empty($_GET['offset'])) ? 0 : (int)$_GET['offset'];
    $number = (empty($_GET['number'])) ? 10 : (int)$_GET['number'];

    $args = array(
        'number' => $number,
        'offset' => $offset
    );

    $comments_query = new WP_Comment_Query;
    $comments = $comments_query->query($args);


    //$years = get_field("available_years", 7);
    return $comments;
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/comments', array(
        'methods' => 'GET',
        'callback' => 'api_comments',
    ));
});


/**
 * Add new comment
 * @return false|int
 */
function api_add_comment()
{
    $name = $_POST['name'];
    $surname = $_POST['surname'];
    $content = $_POST['content'];

    if (empty($_POST['email'])) {
        $email = "anonymous@anon.com";
    } else {
        $email = $_POST['email'];
    }

    $data = array(
        'comment_author' => $name . ' ' . $surname,
        'comment_author_email' => $email,
        'comment_content' => $content,
        'comment_approved' => 0,
        'comment_type' => 'message'
    );

    return wp_new_comment($data);
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/comments/add', array(
        'methods' => 'POST',
        'callback' => 'api_add_comment',
    ));
});


/**
 * Send beauty report
 * @return bool
 */
function api_send_beauty_report()
{

    add_filter('wp_mail_from_name', 'my_mail_from_name');
    function my_mail_from_name($name)
    {
        return "Cosmetica Italia";
    }

    add_filter('wp_mail_from', 'my_mail_from');
    function my_mail_from($email)
    {
        return "beautyreport@gwctest.org";
    }

    $to = $_POST['email'];
    $subject = 'Beauty Report';
    $body = 'Scopri di più sui trend e i numeri della cosmetica!';
    $headers = array('Content-Type: text/html; charset=UTF-8');
    $attachments = array(WP_CONTENT_DIR . "/uploads/BeautyReport.pdf");

    return wp_mail($to, $subject, $body, $headers, $attachments);
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/beautyreport', array(
        'methods' => 'POST',
        'callback' => 'api_send_beauty_report',
    ));
});


/**
 * Create a new selfie
 */
function api_save_selfie()
{

    //include function
    if (!function_exists('wp_handle_upload')) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
    }

    //uploading
    $movefile = wp_handle_upload($_FILES['selfie'], array('test_form' => false));
    //var_dump($movefile);

    //if error is occurred, return error
    if (empty($movefile) && isset($movefile['error'])) {
        return $movefile['error'];
    }

    if (empty($_REQUEST['name'])) {
        $_REQUEST['name'] = 'SELFIE';
    }

    if (empty($_POST['email'])) {
        $_POST['email'] = 'selfie@cosmetica.it';
    }

    //Create Selfie comment
    $data = array(
        'comment_author' => $_REQUEST['name'],
        'comment_author_email' => $_POST['email'],
        'comment_content' => $movefile['url'],
        'comment_approved' => 0,
        'comment_type' => 'selfie'
    );

    wp_new_comment($data);

    return $data;
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/selfie/new', array(
        'methods' => 'POST',
        'callback' => 'api_save_selfie',
    ));
});


/**
 * Create a new selfie
 */
function api_save_selfie_from_str()
{

    $image = $_REQUEST['selfie'];

    $wp_upload_dir = wp_upload_dir()['path'];
    $wp_upload_url = wp_upload_dir()['url'];

    $data = base64_decode(explode(',', $image)[1]);
    $filename = "IMG_" . time() . ".jpeg";

    $filedir = $wp_upload_dir . "/" . $filename;
    $fileurl = $wp_upload_url . "/" . $filename;

    file_put_contents($filedir, $data);

    if (empty($_POST['name'])) {
        $_POST['name'] = 'SELFIE';
    }

    if (empty($_POST['email'])) {
        $_POST['email'] = 'selfie@cosmetica.it';
    }

    //Create Selfie comment
    $data = array(
        'comment_author' => $_POST['name'],
        'comment_author_email' => $_POST['email'],
        'comment_content' => $fileurl,
        'comment_approved' => 0,
        'comment_type' => 'selfie'
    );

    wp_new_comment($data);

    return 1;
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/selfie/new_str', array(
        'methods' => 'POST',
        'callback' => 'api_save_selfie_from_str',
    ));
});

function api_add_watermark()
{
    header('content-type: text/plain');

    if (isset($_POST['image']))
        $image = imagecreatefromjpeg($_POST['image']);
    else
        return false;

    if (isset($_POST['watermark']))
        $watermark = imagecreatefrompng($_POST['watermark']);
    else
        return false;

    $watermark_width = imagesx($watermark);
    $watermark_height = imagesy($watermark);

    $image_width = imagesx($image);
    $image_height = imagesy($image);

    //$dest_x = $image_width - $watermark_width - 5;
    //$dest_y = $image_height - $watermark_height - 5;

    $dest_x = 0;
    $dest_y = 0;

    imagealphablending($image, true);
    imagealphablending($watermark, true);

    imagecopy($image, $watermark, $dest_x, $dest_y, 0, 0, $watermark_width, $watermark_height);

    $wp_upload_dir = wp_upload_dir()['path'];
    $wp_upload_url = wp_upload_dir()['url'];

    $filename = "IMG_" . time() . ".jpeg";

    $filedir = $wp_upload_dir . "/" . $filename;
    $fileurl = $wp_upload_url . "/" . $filename;

    $answer_save = imagejpeg($image, $filedir);

    $data = file_get_contents($filedir);
    $base64 = base64_encode($data);

    imagedestroy($image);
    imagedestroy($watermark);

    unlink($filedir);

    return $base64;
}

add_action('rest_api_init', function () {
    register_rest_route('api', '/selfie/add_watermark', array(
        'methods' => 'POST',
        'callback' => 'api_add_watermark',
    ));
});
