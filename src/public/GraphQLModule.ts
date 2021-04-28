import { EasyExpressServer, IEasyExpressAttachableModule } from '@easy-express/server';
import { GraphQLSchemaModule } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerExpressConfig } from 'apollo-server-express/dist/ApolloServer';
import e from 'cors';
import * as glob from 'glob';

export type ApolloServerConfig = ApolloServerExpressConfig & {
  cors: boolean | e.CorsOptions | e.CorsOptionsDelegate;
};

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
  public attachTo(server: EasyExpressServer, config?: ApolloServerConfig): Promise<unknown> {
    return this.startServer(server, config ? config : {}, config?.cors);
  }

  /**
   *
   * @param server the EasyExpressServer that this module will be attached to
   */
  private async startServer(
    server: EasyExpressServer,
    config: ApolloServerExpressConfig,
    cors?: boolean | e.CorsOptions | e.CorsOptionsDelegate,
  ) {
    const modules: GraphQLSchemaModule[] = await this.loadFiles<GraphQLSchemaModule>(this.pathToModules);
    config.modules = modules;
    this.server = new ApolloServer(config);
    this.server.applyMiddleware({ app: server.instance, cors });
    console.log('🚀 Apollo Server listening at /graphql');
  }

  /**
   * Loads files from a directory and returns them as a array of T.
   * Supports glob patterns.
   *
   * @param path path/glob to a directory containing files of type T
   */
  private async loadFiles<T>(path: string): Promise<T[]> {
    return Promise.all(glob.sync(path).map((file) => import(file))) as Promise<T[]>;
  }
}
