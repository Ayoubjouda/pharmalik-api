import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  private readonly logger = new Logger(AppService.name);
  // @Cron('* * * * * *')
  // handleCron() {
  //   console.log('3');
  // }

  async fetchPharmaciesFromApi() {
    try {
      const data = await this.httpService.axiosRef.get(
        'https://hncd51kk60.execute-api.us-east-1.amazonaws.com/prod/city?radius=15000&latitude=33.57048&longitude=-7.573991&city=CASABLANCA',
      );

      const pharmaciesCasablanca = data.data.map((pharmacie) => ({
        name: pharmacie.pharmacyNameLatin.S,
        city: pharmacie.cityCode.S,
        street: pharmacie.addressLatin.S,
        tel: pharmacie.pharmacyPhone.S,
        latitude: pharmacie.latitude.N,
        longitude: pharmacie.longitude.N,
      }));
      if (pharmaciesCasablanca.length > 0) {
        console.log('Adding pharmacies to the database...');
        await this.prisma.pharmacie.createMany({
          data: pharmaciesCasablanca,
          skipDuplicates: true,
        });
      } else {
        console.log('No pharmacies to add.');
      }
    } catch (error) {
      console.log(error);
    }

    return;
  }

  async getPharmacies() {
    try {
      const pharnacies = await this.prisma.pharmacie.findMany();
      if (pharnacies.length < 0) return;
      return pharnacies;
    } catch (error) {
      console.log(error);
    }
    return;
  }
}
