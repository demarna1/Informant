// Read the dictionary into memory
var dictionary = [];
var dictReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/dictionary.txt')
});
dictReader.on('line', function(line) {
    dictionary.push(line);
});

// Read list of potential round words into memory
var round_words = [];
var wordReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/round_words.txt')
});
wordReader.on('line', function(line) {
    round_words.push(line);
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
    var word = round_words[Math.floor(Math.random()*round_words.length)];
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
    matches.sort(function(a, b) {
        return a.length - b.length || a.localeCompare(b);
    });
    return matches;
};
