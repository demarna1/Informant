#!/usr/bin/python
import random

print '-----------------'
print '-- BOMB DEFUSE --'
print '-----------------'

debug = False

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
players = ['Brett', 'Noah', 'Joelle', 'Mark', 'Jackie']
random.shuffle(players)
spy = players[0]
informants = players[1:]
if debug:
    print '{} is the spy\n'.format(spy)

# Shuffle again and we'll rotate who's being the defuser
random.shuffle(players)
for i in range(num_rounds):
    print 'Round {}:'.format(i+1)

    # Choose the defuser for the round
    defuser = players[i % len(players)]
    print '  {} is the defuser'.format(defuser)

    # Choose the wires - 3 per round for now
    random.shuffle(color_ids)
    colors = color_ids[0:3]
    print '  Wires: \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m'.format(colors[0], colors[1], colors[2])
    random.shuffle(wire_states)
    if debug:
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

    # The players tell the defuser which wire should be cut
    if debug:
        for inf in round_informants:
            print '    {} is informed, thinks the {}'.format(inf, random.choice(informed_hints))
        for minf in round_misinformed:
            print '    {} is misinformed, thinks the {}'.format(minf, random.choice(misinformed_hints))
        for s in round_spies:
            print '    {} is the spy, knows the {}'.format(s, spy_hint)
    else:
        round_players = []
        for inf in round_informants:
            round_players.append((inf, random.choice(informed_hints)))
        for minf in round_misinformed:
            round_players.append((minf, random.choice(misinformed_hints)))
        for s in round_spies:
            round_players.append((s, random.choice(misinformed_hints)))
        random.shuffle(round_players)
        for rp in round_players:
            print '    {} thinks the {}'.format(rp[0], rp[1])

    # The defuser cuts wires until the good wire neutralizes the bomb
    # or the bad wire blows up the bomb
    round_finished = False
    while not round_finished:
        wire_to_cut = raw_input("  Wire to cut: ")
        if wire_to_cut[0] == wire_colors[good_wire][0]:
            print "  You cut the {} wire, which neutralized the bomb, congrats!".format(wire_colors[good_wire])
            round_finished = True
        elif wire_to_cut[0] == wire_colors[dead_wire][0]:
            print "  You cut the {} wire, which did nothing, cut again...".format(wire_colors[dead_wire])
        elif wire_to_cut[0] == wire_colors[bad_wire][0]:
            print "  You cut the {} wire, which blew up the bomb :(".format(wire_colors[bad_wire])
            round_finished = True
        else:
            print "  You typed an invalid color, cut again..."
    raw_input("  ENTER to continue\n")

