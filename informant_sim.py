#!/usr/bin/python
import random
import sys

print '-----------------'
print '-- BOMB DEFUSE --'
print '-----------------'

# 5 Rounds, each round has:
#  1 bad wire
#  1-2 good wires
#  0-1 dead wires
num_rounds = 5
color_ids = [1, 2, 4, 5, 7]
wire_colors = {1:'red', 2:'green', 4:'blue', 5:'purple', 7:'white'}
wire_states = ['good', 'dead', 'bad']

# Assume 5 players for now
# Game roles:
#  1 Spy
#  4 Informants
players = ['Brett', 'Noah', 'Joelle', 'Mark', 'Jack']
random.shuffle(players)
spy = players[0]
informants = players[1:]
print '{} is the spy\n'.format(spy)

# Shuffle again and we'll rotate who's being the defuser
random.shuffle(players)
for i in range(num_rounds):
    print 'Round {}:'.format(i)

    # Choose the defuser for the round
    defuser = players[i % len(players)]
    print '  {} is the defuser'.format(defuser)

    # Choose the wires - 3 per round for now
    random.shuffle(color_ids)
    colors = color_ids[0:3]
    print '  Wires: \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m'.format(colors[0], colors[1], colors[2])
    random.shuffle(wire_states)
    print '         {} {} {}'.format(wire_states[0][0], wire_states[1][0], wire_states[2][0])

    # Populate the possible hints
    for index, state in enumerate(wire_states):
        if state == 'good':
            good_wire = colors[index]
        elif state == 'dead':
            dead_wire = colors[index]
        else:
            bad_wire = colors[index]
    spy_hint = '{} wire is bad'.format(wire_colors[bad_wire])
    informed_hints = [
        '{} wire is good'.format(wire_colors[good_wire]),
        '{} wire is dead'.format(wire_colors[dead_wire])
    ]
    misinformed_hints = [
        '{} wire is good'.format(wire_colors[dead_wire]),
        '{} wire is good'.format(wire_colors[bad_wire]),
        '{} wire is dead'.format(wire_colors[good_wire]),
        '{} wire is dead'.format(wire_colors[bad_wire])
    ]

    # Round roles:
    #  1   Defuser
    #  0-1 Spies
    #  2-3 Informants
    #  1   Misinformed
    round_spies = []
    round_informants = []
    round_misinformed = []
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

    for inf in round_informants:
        print '  {} is informed, thinks the {}'.format(inf, random.choice(informed_hints))
    for minf in round_misinformed:
        print '  {} is misinformed, thinks the {}'.format(minf, random.choice(misinformed_hints))
    for s in round_spies:
        print '  {} is the spy, knows the {}'.format(s, spy_hint)
    sys.stdin.readline()

