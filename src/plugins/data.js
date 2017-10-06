import v4 from 'uuid/v4';
import Plugin from '../plugin';

function initializePlayerData( brinkbit, player ) {
    class PlayerData extends Plugin {

        constructor( initialData ) {
            super( brinkbit, {
                initialData,
                defaults: {
                    _id: v4(),
                },
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
                defaults: {
                    _id: v4(),
                },
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
