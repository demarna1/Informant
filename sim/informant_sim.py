#!/usr/bin/python
import argparse
import logging
import random

log = logging.getLogger()

# Game roles: either spy or informant
#                      misinformed  effective
#  players    spies       rate        rate
#     4         1        3 @ 25%       75%
#     5        1.5       3 @ 10%       30%
#                        4 @ 30%      120%
#     6         2        4 @ 20%       80%
#     7         2        5 @ 25%      125%
#     8         2        6 @ 30%      180%
def getPlayersAndRoles(numPlayers):
    # Create player list
    playerList = ['Noah', 'Joelle', 'Brett', 'Jackie', 'Mark', 'Bre', 'John', 'Elena']
    players = playerList[:numPlayers]

    # Role probabilities
    roleRates = {
        4: [(1, 0.25)],
        5: [(1, 0.30), (2, 0.10)],
        6: [(2, 0.20)],
        7: [(2, 0.25)],
        8: [(2, 0.30)]
    }

    # Choose spies and informants
    random.shuffle(players)
    roleRate = random.choice(roleRates[numPlayers])
    numSpies = roleRate[0]
    roles = {}
    roles['spies'] = players[:numSpies]
    roles['informants'] = players[numSpies:]

    # Choose defuser order
    random.shuffle(players)
    roles['defusers'] = players
    return (roles, roleRate[1])


# Round roles:
#  1 Defuser
#  Spies
#  Informants
#  Misinformed according to misRate
def getRoundRoles(round, roles, misRate):
    # Get the round defuser
    numDefuser = round % len(roles['defusers'])
    if numDefuser == 0:
        random.shuffle(roles['defusers'])
    defuser = roles['defusers'][numDefuser]

    # Get the round spies
    spies = []
    if defuser in roles['spies']:
        roles['spies'].remove(defuser)
        spies.extend(roles['spies'])
        roles['spies'].append(defuser)
    else:
        spies.extend(roles['spies'])

    # Get the informants and misinformed
    informants = []
    misinformed = []
    for player in roles['informants']:
        if player == defuser:
            continue
        if random.random() > misRate:
            informants.append(player)
        else:
            misinformed.append(player)

    # Return the round role map
    roundRoles = {}
    roundRoles['defuser'] = defuser
    roundRoles['spies'] = spies
    roundRoles['informants'] = informants
    roundRoles['misinformed'] = misinformed
    return roundRoles


# TODO Each round has:
#  1 bad wire
#  1-2 good wires
#  0-1 dead wires
def doRound(roundRoles, blockIndex):
    log.info('Block {}:'.format(blockIndex+1))
    log.info('  {} is the defuser'.format(roundRoles['defuser']))
    log.debug('  spies = {}, informants = {}, misinformed = {}'.format(
        roundRoles['spies'], roundRoles['informants'], roundRoles['misinformed']))

    # Choose the wires - 3 per round for now
    colorIds = [1, 2, 4, 5, 7]
    wireColors = {1:'red', 2:'green', 4:'blue', 5:'purple', 7:'white'}
    wireStates = ['good', 'dead', 'bad']
    random.shuffle(colorIds)
    colors = colorIds[0:3]
    log.info('  Wires: \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m \033[1;3{}m|\033[0m'.format(colors[0], colors[1], colors[2]))
    random.shuffle(wireStates)
    log.debug('         {} {} {}'.format(wireStates[0][0], wireStates[1][0], wireStates[2][0]))

    raw_input('  <enter> to continue\n')
    return 'pass'

def main():
    # Process arguments
    parser = argparse.ArgumentParser(description='Bomb Defuse')
    parser.add_argument('numPlayers', metavar='N', type=int, help='number of players')
    parser.add_argument('-d', '--debug', action='store_true', help='debugging')
    args = parser.parse_args()
    logLevel = logging.DEBUG if args.debug else logging.INFO
    logging.basicConfig(format='%(message)s', level=logLevel)
    if args.numPlayers < 4 or args.numPlayers > 8:
        log.error('This game only supports 4 to 8 players')
        return

    log.info('-----------------')
    log.info('   BOMB DEFUSE   ')
    log.info('-----------------')

    (roles, misRate) = getPlayersAndRoles(args.numPlayers)
    log.debug('spies = {}, informants = {}'.format(roles['spies'], roles['informants']))
    log.debug('misinformed rate = {}%'.format(misRate))

    # Rotate who's being the defuser
    round = 0
    numDefused = 0
    numBlown = 0
    while True:
        # Get round roles and do round
        roundRoles = getRoundRoles(round, roles, misRate)
        result = doRound(roundRoles, round % 5)
        if result == 'defused':
            numDefused += 1
        elif result == 'blown':
            numBlown += 1
        round += 1

        # Check bomb status
        if numDefused >= 3:
            log.info('YAY, bomb is defused')
            break;
        elif numBlown >= 3:
            log.info('BOOM! bomb has detonated')
            break;

if __name__ == '__main__':
    main()
