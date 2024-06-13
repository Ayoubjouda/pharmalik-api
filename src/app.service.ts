import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';
import type { Pharmacy } from '@prisma/client';
import { convertStringToCoordinates } from './common/geometry/geometry.helper';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async scrapePharmacies() {
    const pharmacies: Pharmacy[] = [];
    function filterUniquePharmacies(pharmacies: Pharmacy[]): Pharmacy[] {
      const uniquePharmacies: Pharmacy[] = [];
      const seenCoordinates = new Set<string>();

      pharmacies.forEach((pharmacy) => {
        const { latitude, longitude } = pharmacy;
        if (latitude !== null && longitude !== null) {
          const coordinateKey = `${latitude},${longitude}`;
          if (!seenCoordinates.has(coordinateKey)) {
            seenCoordinates.add(coordinateKey);
            uniquePharmacies.push(pharmacy);
          }
        }
      });

      return uniquePharmacies;
    }

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
          console.log(link);
          let response2;
          try {
            response2 = await axios.get(
              `https://www.annuaire-gratuit.ma${link}`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0',
                },
              },
            );
          } catch (error) {
            console.error(
              `Failed to fetch details for ${link}: ${error.message}`,
            );
            continue; // Skip this iteration and proceed to the next one
          }

          const $2 = cheerio.load(response2.data);

          const tbody = $2('tbody');
          const rows = tbody.find('tr');

          const data = {} as Pharmacy;
          data['name'] = name;
          data['quartier'] = quartier;

          if (status === '\nOuvert toute la journée (24 heures)\n') {
            data['status'] = '24h';
          } else if (status === '\nOuvert en ce moment\n') {
            data['status'] = 'jour';
          } else if (status === '\nGarde Nuit (Ouvert de 20h à 9h)\n') {
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
              data['ville'] = ville.toLowerCase();
            } else if (title === 'N° Téléphone') {
              const tel = infoElement
                .find('a[itemprop="telephone"]')
                .text()
                .trim()
                .split(' ')
                .join('');
              data['telephone'] = tel;
            }
          }

          pharmacies.push(data);
        }
      })();
    }

    // fs.writeFileSync(
    //   'pharmacies.json',
    //   JSON.stringify(pharmacies, null, 4),
    //   'utf-8',
    // );
    const uniquePharmacies = filterUniquePharmacies(pharmacies);

    if (uniquePharmacies.length === 0) {
      console.log('Aucune pharmacie trouvée');
      return;
    } else if (uniquePharmacies.length > 1) {
      await this.prismaService.pharmacy.deleteMany();
      await this.prismaService.pharmacy.createMany({
        data: uniquePharmacies as Pharmacy[],
      });
      console.log('scraping Done');
    }
  }
}
