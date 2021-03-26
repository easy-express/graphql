import { EasyExpressServer, IEasyExpressAttachableModule } from '@easy-express/server';
import { GraphQLSchemaModule } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import fs from 'fs';
import { URLSearchParams } from 'url';

/**
 * An EasyExpress module that adds an ApolloServer to one's express application.
 */
export class GraphQLModule implements IEasyExpressAttachableModule {
  private pathToModules: string;
  private server: ApolloServer | null;

  /**
   * Constructs a GraphQL module that will read graphql modules from the directory at the given path.
   *
   * @param pathToModules a path to the directory holding all graphql modules
   */
  constructor(pathToModules: string) {
    this.pathToModules = pathToModules;
    this.server = null;
  }

  /**
   * Creates a new ApolloServer using the modules inside the directory at the given file path.
   * Then, it attaches the /graphql endpoint to the app.
   *
   * @param server the EasyExpressServer that this module will be attached to
   */
  public attachTo(server: EasyExpressServer, context? : (params:ExpressContext)=>object): Promise<unknown> {
    return this.startServer(server,context);
  }

  /**
   *
   * @param server the EasyExpressServer that this module will be attached to
   */
  private async startServer(server: EasyExpressServer,context? : (params:ExpressContext)=>object) {
    const modules: GraphQLSchemaModule[] = await this.loadFiles<GraphQLSchemaModule>(this.pathToModules);
    this.server = new ApolloServer({ modules, context });
    this.server.applyMiddleware({ app: server.instance });
    console.log('🚀 Apollo Server listening at /graphql');
  }

  /**
   * Loads all files inside the directory at the given path and returns
   * the contents as a list of <T>.
   *
   * @param path path to a directory holding files of type T
   */
  private async loadFiles<T>(path: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, async (err, filenames) => {
        const typeDefs: T[] = [];

        if (err) {
          reject(err.message);
        }

        for (const filename of filenames) {
          const entity = await import(path + filename);
          typeDefs.push(entity as T);
        }

        resolve(typeDefs);
      });
    });
  }
}
