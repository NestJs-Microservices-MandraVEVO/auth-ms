import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
        PORT: number;
        
        NATS_SERVERS: string[];

        JWT_SECRET: string;
        
        // MongoDB - Opción 1: Variables separadas (RECOMENDADO para Docker)
        MONGO_USER: string;
        MONGO_PASSWORD: string;
        MONGO_DB_NAME: string;
        MONGO_HOST: string;
        
        // MongoDB - Opción 2: URI completa (para conexiones externas)
        // MONGO_URI: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    

    NATS_SERVERS: joi.array().items(joi.string()).required(),///validar nats servers
    JWT_SECRET: joi.string().required(),//validar jwt secret
   
    // MongoDB - Opción 1: Variables separadas
    MONGO_USER: joi.string().required(),
    MONGO_PASSWORD: joi.string().required(),
    MONGO_DB_NAME: joi.string().required(),
    MONGO_HOST: joi.string().required(),
    
    // MongoDB - Opción 2: URI completa (comentado)
    // MONGO_URI: joi.string().required(),
})
.unknown(true);

const{error, value} = envsSchema.validate(
    {
        ...process.env,
        NATS_SERVERS: process.env.NATS_SERVERS?.split(','), //para separar los servidores ya que estan en arreglo
    }
);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value; 


export const envs= {
    port: envVars.PORT,
    
    natsServers: envVars.NATS_SERVERS,
   
    // MongoDB - Opción 1: Variables separadas
    mongoUser: envVars.MONGO_USER,
    mongoPassword: envVars.MONGO_PASSWORD,
    mongoDbName: envVars.MONGO_DB_NAME,
    mongoHost: envVars.MONGO_HOST,
    jwtSecret: envVars.JWT_SECRET,
    
    // MongoDB - Opción 2: URI completa (comentado)
    // mongoUri: envVars.MONGO_URI,
}
