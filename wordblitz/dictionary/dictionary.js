// Read the dictionary into memory
var dictionary = [];
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/dictionary.txt')
});
lineReader.on('line', function(line) {
    dictionary.push(line);
});

// Shuffle a string
String.prototype.shuffle = function () {
    var a = this.split('');
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join('');
}

// Return a random 6-letter word from the dictionary
exports.getWord = function() {
    var candidates = dictionary.filter(function(word) {
        return word.length == 6;
    });
    var word = candidates[Math.floor(Math.random()*candidates.length)];
    return word.shuffle().toUpperCase();
};

// Return the matches
exports.getMatches = function(word) {
    var matches = [];
    for (var i = 0; i < dictionary.length; i++) {
        var candidate = dictionary[i].toUpperCase();
        var wordToMatch = word.toUpperCase();
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
