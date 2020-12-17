<h1 align="center">Welcome to Easy-Express's GraphQL Module 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/@easy-express/graphql" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/@easy-express/graphql.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> A module that attaches an ApolloServer to your Easy-Express Server!

### 🏠 [Homepage](https://github.com/easy-express/graphql#readme)

## Introduction

To start using ApolloServer's awesome capabilities, simply attach a `GraphQLModule` to your `EasyExpressServer` and you're good to go!

## Install

```sh
npm install @easy-express/graphql
```

## Setup

Create a new directory to hold all of your GraphQL modules. Each file in this directory should export `typeDefs` and `resolvers` like the example below:

```ts
import { gql } from 'apollo-server-express';
import { Balances } from '../entities/Balances';
import { getRepository } from 'typeorm';

export const typeDefs = gql`
  type Balance {
    id: ID!
    date: String!
    balance: Float!
  }

  extend type Query {
    get_all_balances: [Balance]
  }

  extend type Mutation {
    insert_balance(id: ID!, date: String!, balance: Float!): Balance
  }
`;
export const resolvers = {
  Query: {
    get_all_balances: async () => getRepository(Balances).find(),
  },
  Mutation: {
    insert_balance: async (obj: any, args: any) => {
      const balance = new Balances();
      balance.date = args.date;
      balance.balance = args.balance;
      return getRepository(Balances).save(balance);
    },
  },
};
```

## Usage

Create a new `GraphQLModule` and pass the path to the directory holding all your graphql modules. Then, simply attach the module to your `EasyExpressServer`. This will add the '/graphql' endpoint to your app.

### Example

```ts
import { EasyExpressServer } from '@easy-express/server';
import { DatabaseModule } from '@easy-express/typeorm';
import { GraphQLModule } from '@easy-express/graphql';
import * as dotenv from 'dotenv';

// load env vars from .env file
dotenv.config();

// create a new server
let server = new EasyExpressServer();

// define routes for your server...
server.instance.get('/', (req, res) => {
  res.send('Hello World!');
});

// attach the modules
server.attachModule(new GraphQLModule(__dirname + '/graphql-modules/')).then(() => {
  server
    .attachModule(new DatabaseModule(__dirname + '/entities/'))
    .then(() => {
      // Start the server after you've attached the two module
      server.start();
    })
    .catch((e) => {
      console.error(e);
      return e;
    });
});
```

## Author

👤 **Leonard Parisi**

- Website: leonardparisi.com
- Github: [@leonardparisi](https://github.com/leonardparisi)
- LinkedIn: [@https:\/\/www.linkedin.com\/in\/lenny-parisi\/](https://linkedin.com/in/lenny-parisi/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/easy-express/graphql/issues). You can also take a look at the [contributing guide](https://github.com/easy-express/graphql/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

Bitcoin Wallet Address: 3PjDkxNznkx7HVmVdfSMYgGJeeJzoDH7e6
