# The dictionary is filtered from the following source:
# https://raw.githubusercontent.com/joeyschoblaska/unscramble/master/dictionary.txt

import random

with open('dictionary.txt') as f:
    dictionary = f.readlines()
dictionary = [word.strip() for word in dictionary]
wordmasters = [word for word in dictionary if len(word) == 6]

wordmaster = random.choice(wordmasters)
matches = []
for word in dictionary:
    found = True
    wm_array = list(wordmaster)
    for c in word:
        if c in wm_array:
            wm_array.remove(c)
        else:
            found = False
            break;
    if found:
        matches.append(word)
matches.sort(key=len)

print(wordmaster)
print(matches)
print(len(matches))
