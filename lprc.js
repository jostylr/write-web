/* global require, module */

module.exports = function(Folder, args) {

    if (args.file.length === 0) {
        args.file = ["project.md"];
    }
    args.build = ".";

};
