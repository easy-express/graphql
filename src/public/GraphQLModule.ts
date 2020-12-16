import { EasyExpressServer, IEasyExpressAttachableModule } from '@easy-express/server';
import { GraphQLSchemaModule } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import fs from 'fs';

export class GraphQLModule implements IEasyExpressAttachableModule {
  private pathToModules: string;
  private server: ApolloServer | null;

  constructor(pathToModules: string) {
    this.pathToModules = pathToModules;
    this.server = null;
  }

  attachTo(server: EasyExpressServer): Promise<unknown> {
    return this.startServer(server);
  }

  private async startServer(server: EasyExpressServer) {
    const modules: GraphQLSchemaModule[] = await this.loadFiles<GraphQLSchemaModule>(this.pathToModules);
    this.server = new ApolloServer({ modules });
    this.server.applyMiddleware({ app: server.instance });
    console.log('🚀 Apollo Server listening at /graphql !');
  }

  private async loadFiles<T>(path: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, async (err, filenames) => {
        const typeDefs: T[] = [];

        if (err) {
          reject(err.message);
        }

        for (const filename of filenames) {
          const entity = await import(path + filename);
          typeDefs.push(Object.values(entity)[0] as T);
        }

        resolve(typeDefs);
      });
    });
  }
}
