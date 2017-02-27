```javascript
// create a new Brinkbit instance
const brinkbit = new Brinkbit({
    base: '/api', // the route of your application on which the server-side sdk is listening
    appId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx', // your unique app id (can be retrieved from brinkbit console)
});
```

```javascript
// create a new user
const user = new brinkbit.User({
    username: 'Violet',
    email: 'violet@trialbyfireball.com',
    password: 'FireballsAreTheWorst',
});
user.save()
.then(() => {
    // user has been created on server
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
    uri: '/users/12345/',
    data: {
        email: 'violet2@trialbyfireball.com',
    },
});
```
