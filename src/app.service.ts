import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { convertStringToCoordinates } from 'utils/utils';

import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';
import type { Pharmacy } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private prismaService: PrismaService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scrapePharmacies() {
    const pharmacies: Pharmacy[] = [];

    console.log('Veuillez patienter quelques instants...');

    const hrefFile = fs.readFileSync('href.txt', 'utf-8').split('\n');

    for (const ville of hrefFile) {
      const response = await axios.get(
        `https://www.annuaire-gratuit.ma${ville.replace('\n', '')}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        },
      );

      const $ = cheerio.load(response.data);

      const locItems = $('li[itemtype="http://schema.org/Place"]');
      await (async () => {
        for (const element of locItems) {
          const linkElement = $(element).find('a[itemprop="url"]');
          const statusElement = $(element).find('span[class="garde_status"]');
          const nameElement = $(element).find('h3[itemprop="name"]');
          const quartierElement = $(element).find(
            'span[itemprop="addressLocality"]',
          );

          const link = linkElement.attr('href');
          const status = statusElement.text();
          const name = nameElement.text();
          const quartier = quartierElement.text();

          const response2 = await axios.get(
            `https://www.annuaire-gratuit.ma${link}`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0',
              },
            },
          );

          const $2 = cheerio.load(response2.data);

          const tbody = $2('tbody');
          const rows = tbody.find('tr');

          const data = {} as Pharmacy;
          data['name'] = name;
          data['quartier'] = quartier;

          if (status === '\nOuvert toute la journée (24 heures)\n') {
            data['status'] = 'garde 24h';
          } else if (status === '\nGarde Jour (Ouvert entre 9h et 23h)\n') {
            data['status'] = 'jour';
          } else {
            data['status'] = 'nuit';
          }

          for (const row of rows) {
            const titleElement = $2(row).find('td[class="title_details"]');
            const infoElement = $2(row).find('td[class="infos_details"]');

            const title = titleElement.text();
            const info = infoElement.text();

            if (title === 'Adresse') {
              const address = infoElement.find('address').text().trim();
              const coordLink = infoElement.find('a[href]').attr('href');
              data['address'] = address ? address : 'Non disponible';
              const cords = coordLink.replace(
                'https://maps.google.com/maps?q=',
                '',
              );
              const [latitude, longitude] = convertStringToCoordinates(cords);

              data['latitude'] = latitude;
              data['longitude'] = longitude;
            } else if (title === 'Ville') {
              const ville = info.trim();
              data['ville'] = ville;
            } else if (title === 'N° Téléphone') {
              const tel = infoElement
                .find('a[itemprop="telephone"]')
                .text()
                .trim();
              data['telephone'] = tel;
            }
          }

          pharmacies.push(data);
        }
      })();
    }

    fs.writeFileSync(
      'pharmacies.json',
      JSON.stringify(pharmacies, null, 4),
      'utf-8',
    );
    if (pharmacies.length === 0) {
      console.log('Aucune pharmacie trouvée');
      return;
    } else if (pharmacies.length === 1) {
      await this.prismaService.pharmacy.deleteMany();
      await this.prismaService.pharmacy.createMany({
        data: pharmacies as Pharmacy[],
      });
      console.log('scraping Done');
    }
  }
}
