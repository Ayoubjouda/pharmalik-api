import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { PharmacyModule } from './pharmacy/pharmacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule,
    PharmacyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
