#!/usr/bin/python
import random

print "-----------------"
print "-- BOMB DEFUSE --"
print "-----------------"

# 5 Rounds, each round has:
#  1 bad wire
#  1-2 good wires
#  0-1 dead wires
num_rounds = 5;

# Assume 5 players for now
# Game roles:
#  1 Spy
#  4 Informants
players = ["Brett", "Noah", "Joelle", "Mark", "Jack"];
random.shuffle(players);
spy = players[0];
informants = players[1:]
print "{} is the spy\n".format(spy)

# Shuffle again and we'll rotate who's being the defuser
random.shuffle(players);
for i in range(num_rounds):
    # Round roles:
    #  1   Defuser
    #  0-1 Spies
    #  2-3 Informants
    #  1   Misinformed
    defuser = players[i % len(players)];
    round_spies = [];
    round_informants = [];
    round_misinformed = [];
    random.shuffle(informants)
    if defuser == spy:
        round_misinformed.extend(informants[0:2])
        round_informants.extend(informants[2:])
    else:
        round_spies.append(spy)
        informants.remove(defuser)
        round_misinformed.append(informants[0])
        round_informants.extend(informants[1:])
        informants.append(defuser)

    print "Round {}:".format(i)
    print "  {} is the defuser".format(defuser)
    for inf in round_informants:
        print "  {} is informed".format(inf)
    for minf in round_misinformed:
        print "  {} is misinformed".format(minf)
    print ""

