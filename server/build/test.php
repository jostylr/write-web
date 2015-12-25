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
            <?php
            echo "var url = 'auto.jostylr.com/$userproj'";
            ?>
            
            var call = function () {
                ajax(url, function (text) {
                    $("#compile").innerHTML = 
                        "<p>Compiling is done</p><pre>" + text + "</pre>";
                    pull();
                });
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
        <p> This page is compiling and updating the test page for 
        <?php echo $userproj ?> </p>
        <div id="compile"></div>
        <div id="pull"></div>
        <div id="load"></div>


    </body>
</html>
