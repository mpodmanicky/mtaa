# Technical Documentation: STUFace - Version 1.0.0

**Document Version:** 1.0.0
**Date:** 25.03.2025
**Authors:** Podmanicky, M.,

This technical documentation is a description of the backend of the application, including libraries and dependencies we used.

## Starter
To start off we need a basic framework and connection to the postgres database (see docker-compose.yml).
To install:

```npm i express pg ```

Express provides an easy to use http framework, very readible, extensible and begginer friendly. *pg* is a dependency that allows us to connect to desired database and run queries.
With this setup we can create an http server with basic endpoint. In the code we import:

``` 
const express = require('express'); 
const app = express(); 
const { Pool } = require('pg');
```

Now we can setup a simple endpoint which returns "Hello World". To do so, we use the *get* method.
After you write your request, we need the server to be running. This is done through the *listen* function in express.

```
app.listen(port, () => {
// you can console.log here so that you know your server is running on localhost:port
})
```

