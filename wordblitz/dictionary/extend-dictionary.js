/*
 * The base dictionary doesn't have plurals and past tense so
 * create an extended dictionary.
 *
 * The base dictionary was filtered from the following source:
 * https://raw.githubusercontent.com/joeyschoblaska/unscramble/master/dictionary.txt
 *
 * Before:
 * - Bad words and 7+letter words should already be removed before
 *   running this script.
 * - npm install pluralize and tensify and download the official
 *   scrabble dictionary text file.
 *
 * After:
 * - Run the command "awk '!a[$0]++' file" to remove duplicates.
 */

var tensify = require('tensify');
var pluralize = require('pluralize');

// Read scrabble dictionary for compare
var scrabbleDict = [];
var scrabbleReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/scrabble-dictionary.txt')
});
scrabbleReader.on('line', function(line) {
    scrabbleDict.push(line);
});
scrabbleReader.on('close', function() {
    // Tensify real dictionary
    var dictionary = [];
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(__dirname + '/dictionary.txt')
    });
    lineReader.on('line', function(line) {
        dictionary.push(line);
    });
    lineReader.on('close', function() {
        for (var i = 0; i < dictionary.length; i++) {
            var word = dictionary[i];
            console.log(word);

            // Add past tense
            try {
                var past = tensify(word).past;
                if (dictionary.indexOf(past) > -1) {
                    continue;
                }
                if (past !== word && past.length <= 6 &&
                    scrabbleDict.indexOf(past.toUpperCase()) > -1) {
                    console.log(past);
                }
            } catch (err) { }

            // Add plural
            var plural = pluralize(word);
            if (dictionary.indexOf(plural) > -1) {
                continue;
            }
            if (plural !== word && plural.length <= 6 &&
                scrabbleDict.indexOf(plural.toUpperCase()) > -1) {
                console.log(plural);
            }
        }
    });
});
