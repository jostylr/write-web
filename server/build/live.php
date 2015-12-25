<html>
    <head>
        <?php
            $userproj = file_get_contents("userproj.txt");
        ?>
        <script>
            var $ = document.querySelector;
            
            var ajax = function (url, cb) {
                var req = new XMLHttpRequest();
                req.onreadystatechange =  function () {
                    if req.readyState === XMLHttpRequest.DONE) {
                        if (req.status === 200) {
                            cb(req.responseText);
                        } else {
                           cb("ERROR in Status" + req.responseText);  
                        }
                    }
                };
                req.open('GET', url);
                req.send();
            };
            var pull = function () {
                ajax("pull.php", function (text) {
                    $("#pull").innerHTML = 
                        "<p>Pull is done.</p><pre>" + text + "</pre>";
                    load();
                }); 
            };
            var load = function () {
                ajax("load.php", function (text) {
                    $("#load").innerHTML = 
                        "<p>Resource loading is done.</p>" + text;
                 });
            };
        </script>
    </head>
    <body>
        <p> This page is updating the page for 
        <?php echo $userproj ?> </p>
       
        <div id="pull"></div>
        <div id="load"></div>


    </body>
</html>
