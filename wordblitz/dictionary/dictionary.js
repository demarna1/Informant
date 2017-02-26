var dictionary = [];
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/dictionary.txt')
});
lineReader.on('line', function(line) {
    dictionary.push(line);
});

// Return a random 6-letter word from the dictionary
exports.getWord = function() {
    var candidates = dictionary.filter(function(word) {
        return word.length == 6;
    });
    return candidates[Math.floor(Math.random()*candidates.length)];
};

// Return the matches
exports.getMatches = function(word) {
    var matches = [];
    for (var i = 0; i < dictionary.length; i++) {
        var candidate = dictionary[i];
        var wordToMatch = word;
        var found = true;
        for (var j = 0; j < candidate.length; j++) {
            var index = wordToMatch.indexOf(candidate[j]);
            if (index > -1) {
                wordToMatch = wordToMatch.slice(0, index) + wordToMatch.slice(index+1);
            } else {
                found = false;
                break;
            }
        }
        if (found) {
            matches.push(candidate);
        }
    }
    return matches;
};
