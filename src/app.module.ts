import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { ItemModule } from './modules/item/item.module';
import { IndentModule } from './modules/indent/indent.module';
import { MIModule } from './modules/mi/mi.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { RFQModule } from './modules/rfq/rfq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        },
        level: 'info',
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    RolesModule,
    ItemModule,
    IndentModule,
    MIModule,
    VendorModule,
    RFQModule,
  ],
})
export class AppModule {}
