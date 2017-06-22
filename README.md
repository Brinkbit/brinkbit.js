```javascript
// create a new Brinkbit instance
const brinkbit = new Brinkbit({
    base: '/api', // the route of your application on which the server-side sdk is listening
    gameId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx', // your unique game id (can be retrieved from brinkbit console)
});
```

```javascript
// create a new player
const player = new brinkbit.Player({
    username: 'Violet',
    email: 'violet@trialbyfireball.com',
    password: 'FireballsAreTheWorst',
});
player.save()
.then(() => {
    // player has been created on server
});
```

```javascript
brinkbit.on( 'login', ( event ) => {
    console.log( event.player );
});

// login a player
brinkbit.login({
    username: 'Violet', // can also be email
    password: 'FireballsAreTheWorst',
})
.then(( player ) => {
    // player is an authenticated player object
});
```

## Low level requests

```javascript
brinkbit.get( '/players/12345/' );
```

```javascript
brinkbit.put({
    uri: '/players/12345/',
    data: {
        email: 'violet2@trialbyfireball.com',
    },
});
```
