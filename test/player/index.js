import chai from 'chai';
import uuid from 'uuid';

import Brinkbit from '../../src';
import env from '../../env';

const { expect } = chai;

describe( 'Player', function() {
    before( function() {
        this.brinkbit = new Brinkbit( env.client.config );
    });

    it( 'should expose a class', function() {
        expect( this.brinkbit.Player ).to.be.a( 'function' );
    });

    it( 'should create a new instance', function() {
        const player = new this.brinkbit.Player();
        expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
    });

    it( 'should extend instance with config', function() {
        const player = new this.brinkbit.Player();
        expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
    });

    describe( 'player.fetch', function() {
        before( function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                this.player = player;
            });
        });

        it( 'should update locally with user\'s data from the server', function() {
            const player = new this.brinkbit.Player({
                token: this.player.token,
            });
            expect( player ).to.have.property( 'token' ).and.equal( this.player.token );
            return player.fetch()
            .then(() => {
                expect( player.data.username ).to.equal( this.player.data.username );
                expect( player.data.email ).to.equal( this.player.data.email );
            });
        });

        it( 'should reject if token is not a string', function( done ) {
            const player = new this.brinkbit.Player();
            player.fetch()
            .catch(() => {
                done();
            });
        });
    });

    describe( 'player.save', function() {
        it( 'should create a new player if no id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            const player = new this.brinkbit.Player({
                username,
                email,
                password: 'FireballsAreTheBest',
            });
            return player.save()
            .then(( response ) => {
                expect( response.body.username ).to.equal( username );
                expect( response.body.email ).to.equal( email );
            });
        });

        it( 'should update a player if it has an id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const email = `fireball${rand}@trialbyfireball.com`;
            const newEmail = `fireball${uuid.v4().slice( 0, 5 )}@trialbyfireball.com`;
            const username = `fireball_${rand}`;
            return this.brinkbit.Player.create({
                username,
                email,
                password: 'FireballsAreTheBest',
            })
            .then( player =>
                player.login()
                .then(() => player.save({
                    body: {
                        email: newEmail,
                    },
                }))
                .then(( response ) => {
                    expect( response.body.email ).to.equal( newEmail );
                    expect( player.data.email ).to.equal( newEmail );
                })
            );
        });
    });

    describe( 'player.create', function() {
        it( 'should create and save a new user', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            return this.brinkbit.Player.create({
                username,
                email,
                password: 'FireballsAreTheBest',
            })
            .then(( player ) => {
                expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
                expect( player.data.username ).to.equal( username );
                expect( player.data.email ).to.equal( email );
            });
        });
    });

    describe( 'playerdata', function() {
        before( function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                this.player = player;
            });
        });

        it( 'should create and save new player data', function() {
            return this.player.Data.create({
                prop: 'someData',
                _id: 'myId',
            })
            .then(( playerData ) => {
                expect( playerData ).to.be.an.instanceOf( this.player.Data );
                expect( playerData.data.prop ).to.equal( 'someData' );
                expect( playerData.data._id ).to.equal( 'myId' );
            });
        });

        it( 'should destroy player data', function() {
            const playerData = new this.player.Data({
                prop: 'someData',
                _id: 'myId',
            });
            return playerData.destroy()
            .then(() => {
                expect( playerData.id ).to.equal( undefined );
            });
        });
    });

    describe( 'analytics', function() {
        before( function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                this.player = player;
            });
        });

        it( 'should create and save new analytic', function() {
            return this.player.Analytic.create({
                type: 'someMetric',
                prop: 'someData',
            })
            .then(( analytic ) => {
                this.player.analytic = analytic;
                expect( analytic ).to.be.an.instanceOf( this.player.Analytic );
                expect( analytic.data.type ).to.equal( 'someMetric' );
                expect( analytic.data.prop ).to.equal( 'someData' );
            });
        });

        it( 'should create and save a session', function() {
            return this.player.Analytic.create({
                type: 'session',
            })
            .then(( analytic ) => {
                expect( analytic ).to.be.an.instanceOf( this.player.Analytic );
                expect( analytic.data.type ).to.equal( 'session' );
            });
        });

        it( 'should destroy analytic', function() {
            return this.player.analytic.destroy()
            .then(() => {
                expect( this.player.analytic.id ).to.equal( undefined );
            });
        });
    });

    describe( 'third party plugins', function() {
        before( function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                this.player = player;
            });
        });

        describe( 'player plugin', function() {
            it( 'should add the plugin to the Player class and primary player', function() {
                const plugin = {
                    name: 'CustomPlugin',
                    type: 'player',
                    initialize: () => {
                        class CustomPlugin {}
                        return CustomPlugin;
                    },
                };
                this.brinkbit.use( plugin );
                expect( this.brinkbit.Player.primary ).to.have.property( 'CustomPlugin' );
            });
        });

        describe( 'game plugin', function() {
            it( 'should add the plugin to the Player class and primary player', function() {
                const plugin = {
                    name: 'CustomPlugin',
                    type: 'game',
                    initialize: () => {
                        class CustomPlugin {}
                        return CustomPlugin;
                    },
                };
                this.brinkbit.use( plugin );
                expect( this.brinkbit ).to.have.property( 'CustomPlugin' );
            });
        });
    });
});
