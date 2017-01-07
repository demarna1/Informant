#!/usr/bin/python
import argparse
import logging
import random

log = logging.getLogger()

# Game roles: either spy or informant
#
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
    random.shuffle(players)

    # Role probabilities
    roleRates = {
        4: [(1, 0.25)],
        5: [(1, 0.30), (2, 0.10)],
        6: [(2, 0.20)],
        7: [(2, 0.25)],
        8: [(2, 0.30)]
    }

    # Choose spies and informants
    roleRate = random.choice(roleRates[numPlayers])
    numSpies = roleRate[0]
    roles = {}
    for p in players[:numSpies]:
        roles[p] = 'spy'
    for p in players[numSpies:]:
        roles[p] = 'informant'
    log.debug('spies = {}, informants = {}'.format(players[:numSpies], players[numSpies:]))
    return (players, roles, roleRate[1])

# TODO Each round has:
#  1 bad wire
#  1-2 good wires
#  0-1 dead wires
#color_ids = [1, 2, 4, 5, 7]
#wire_colors = {1:'red', 2:'green', 4:'blue', 5:'purple', 7:'white'}
#wire_states = ['good', 'dead', 'bad']
def doRound(defuser, blockIndex):
    log.info('Block {}:'.format(blockIndex+1))
    log.info('  {} is the defuser'.format(defuser))
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

    (players, roles, missRate) = getPlayersAndRoles(args.numPlayers)

    # Rotate who's being the defuser
    round = 0
    numDefused = 0
    numBlown = 0
    while True:
        if round % len(players) == 0:
            random.shuffle(players)
        defuser = players[round % len(players)]
        result = doRound(defuser, round % 5)
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
