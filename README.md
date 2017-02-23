```javascript
// create a new Brinkbit instance
const brinkbit = new Brinkbit({
    base: '/api', // the route of your application on which the server-side sdk is listening
    appName: 'TrialByFireball', // used as a prefix for storage purposes
    appId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx', // your unique app id (can be retrieved from brinkbit console)
});
```

```javascript
// create a new user
brinkbit.User.create({
    username: 'Violet',
    email: 'violet@trialbyfireball.com',
    password: 'FireballsAreTheWorst',
})
.then(( user ) => {
    // user is an instance of brinkbit.User
});
```

```javascript
brinkbit.on( 'login', ( event ) => {
    console.log( event.user );
});

// login a user
brinkbit.login({
    username: 'Violet', // can also be email
    password: 'FireballsAreTheWorst',
})
.then(( user ) => {
    // user is an authenticated user object
});
```

## Low level requests

```javascript
brinkbit.get( '/users/12345/' );
```

```javascript
brinkbit.put({
    url: '/users/12345/',
    data: {
        email: 'violet2@trialbyfireball.com',
    },
});
```
