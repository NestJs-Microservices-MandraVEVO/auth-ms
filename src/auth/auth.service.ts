import { status } from './../../node_modules/effect/src/Fiber';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {

    private readonly logger = new Logger('AuthService');

    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    onModuleInit() {
        this.logger.log('✅ Auth Service initialized with Mongoose');
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
                token: 'fake-jwt-token'
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
