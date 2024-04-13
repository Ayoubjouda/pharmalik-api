import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
// import { decode } from '@mapbox/polyline';
import { ConfigService } from '@nestjs/config';
import { DirectionDto } from './dto/pharmacy.dto';
@Injectable()
export class PharmacyService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}
  findAll() {
    function toRadians(degrees: number): number {
      return (degrees * Math.PI) / 180;
    }

    function toDegrees(radians: number): number {
      return (radians * 180) / Math.PI;
    }
    function calculateBoundary(
      lat: number,
      lon: number,
      radius: number,
    ): { lat: [number, number]; lon: [number, number] } {
      // Earth radius in kilometers
      const earthRadius: number = 6371.0;

      // Convert latitude and longitude from degrees to radians
      const latRad: number = toRadians(lat);
      const lonRad: number = toRadians(lon);

      // Calculate the angular distance in radians
      const angularDistance: number = radius / earthRadius;

      // Calculate the latitude boundaries
      const latMin: number = toDegrees(latRad - angularDistance);
      const latMax: number = toDegrees(latRad + angularDistance);

      // Calculate the longitude boundaries
      const deltaLon: number = Math.asin(
        Math.sin(angularDistance) / Math.cos(latRad),
      );
      const lonMin: number = toDegrees(lonRad - deltaLon);
      const lonMax: number = toDegrees(lonRad + deltaLon);

      return {
        lat: [latMin, latMax],
        lon: [lonMin, lonMax],
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pharmacy`;
  }
  //   async findDirection(query: DirectionDto) {
  //     const { start, dest } = query;
  //     try {
  //       //otherwise, you'll have an 'unauthorized' error.
  //       const resp = await fetch(
  //         `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${dest}&key=${this.configService.get(
  //           'GOOGLE_MAPS_DIRECTIONS_API_KEY',
  //         )}`,
  //       );
  //       if (!resp.ok) {
  //         throw new Error('Something went wrong');
  //       }

  //       const respJson = await resp.json();
  //       const points = decode(respJson.routes[0].overview_polyline.points);
  //       const coords = points.map((point: number[]) => {
  //         return {
  //           latitude: point[0],
  //           longitude: point[1],
  //         };
  //       });

  //       return coords;
  //     } catch (error) {
  //       return error;
  //     }
  //   }
  // }
  async getPharmacys() {
    try {
      const pharmacies = await this.prismaService.pharmacy.findMany();
      return pharmacies;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async findDirection(query: DirectionDto) {
    const { start, dest } = query;
    try {
      //otherwise, you'll have an 'unauthorized' error.
      const resp = await fetch(
        `http://ors-app:8080/ors/v2/directions/driving-car?start=${start}&end=${dest}`,
      );
      if (!resp.ok) {
        throw new Error('Something went wrong');
      }

      const respJson = await resp.json();
      const points = respJson.features[0].geometry.coordinates;
      const coords = points.map((point: number[]) => {
        return {
          latitude: point[1],
          longitude: point[0],
        };
      });

      return coords;
    } catch (error) {
      return error;
    }
  }
}
