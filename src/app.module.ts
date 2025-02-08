import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 30, // cache for 30 seconds
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
