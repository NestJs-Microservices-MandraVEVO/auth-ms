import { status } from './../../node_modules/effect/src/Fiber';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService implements OnModuleInit {

    private readonly logger = new Logger('AuthService');

    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>
        
    ) {
        
    }

    onModuleInit() {
        this.logger.log('✅ Auth Service initialized with Mongoose');

    }

    async signJWT(payload: JwtPayload){
        return this.jwtService.sign(payload)
    }


    async verifyToken(token: string ){
        try {
        const {sub, iat, exp, ...user} = this.jwtService.verify(token,{
            secret: envs.jwtSecret,

        });

        return{
            user: user,
            token: await this.signJWT(user),
        }


        } catch (error) {
            console.log(error);
            throw new RpcException({
                status: 401,
                message: 'Invalid token'
            });
        }
    }
    // Métodos de ejemplo para trabajar con MongoDB
    async registerUser(registerUserDto: RegisterUserDto){
        const {email, name, password}= registerUserDto;

    
        try {
            
            const user = await this.userModel.findOne({
                email: email
            });

            if(user){
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                });
            }
            
            const newUser = await this.userModel.create({
                email: email,
                name: name,
                password: bcrypt.hashSync(password, 10),
            });

            const { _id, email: userEmail, name: userName } = newUser.toJSON();

            return {
                user: {
                    id: _id,
                    email: userEmail,
                    name: userName
                },
                token: await this.signJWT({ id: _id.toString(), email: userEmail, name: userName })
            }

        }
        catch (error) {
                throw new RpcException({
                status: 400,
                message: error.message
            })
        }
    }


    async loginUser(loginUserDto: LoginUserDto){
        const {email, password}= loginUserDto;

    
        try {
            
            const user = await this.userModel.findOne({
                email: email
            });

            if(!user){
                throw new RpcException({
                    status: 400,
                    message: 'User incorrect'
                });
            }
            
            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if(!isPasswordValid){
                throw new RpcException({
                    status: 400,
                    message: 'Password incorrect'
                })
            }

            const { _id, email: userEmail, name: userName } = user.toJSON();

            return {
                user: {
                    id: _id,
                    email: userEmail,
                    name: userName
                },
                token: await this.signJWT({ id: _id.toString(), email: userEmail, name: userName })
            }

        }
        catch (error) {
                throw new RpcException({
                status: 400,
                message: error.message
            })
        }
    }


}
