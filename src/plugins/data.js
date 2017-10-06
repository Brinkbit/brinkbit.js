import Plugin from '../plugin';

function initializePlayerData( brinkbit, player ) {
    class PlayerData extends Plugin {

        constructor( initialData ) {
            super( brinkbit, {
                initialData,
                pluginId: 'playerdata',
                type: 'player',
                player,
            });
        }
    }

    return PlayerData;
}

function initializeGameData( brinkbit ) {
    class GameData extends Plugin {

        constructor( initialData ) {
            super( brinkbit, {
                initialData,
                pluginId: 'gamedata',
                type: 'game',
            });
        }
    }

    return GameData;
}

const config = [{
    name: 'Data',
    type: 'player',
    initialize: initializePlayerData,
},
{
    name: 'Data',
    type: 'game',
    initialize: initializeGameData,
}];

export default config;
