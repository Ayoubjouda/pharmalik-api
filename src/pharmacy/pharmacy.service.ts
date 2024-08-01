import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CoordinatesDto, DirectionDto } from './dto/pharmacy.dto';
import { calculateBoundary } from 'src/common/geometry/geometry.helper';
import { Pharmacy } from '@prisma/client';

@Injectable()
export class PharmacyService {
  constructor(private prismaService: PrismaService) {}

  // Get all pharmacies within a 5km radius of the provided latitude and longitude
  async findNerbyPharmacy(query: CoordinatesDto) {
    const { lat, lon } = calculateBoundary(
      Number(query.latitude),
      Number(query.longitude),
      query.radius,
    );
    const prismaArgs = {
      where: {
        latitude: {
          gte: lat[0],
          lte: lat[1],
        },
        longitude: {
          gte: lon[0],
          lte: lon[1],
        },
        // Conditionally add status filter
        ...(query.filter ? { status: { equals: query.filter } } : {}),
      },
    };
    try {
      return await this.prismaService.pharmacy.findMany(prismaArgs);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // Get all pharmacies
  async getAllPharmacys() {
    try {
      const pharmacies = await this.prismaService.pharmacy.findMany();
      return pharmacies;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get the direction between two points
  async findDirection(query: DirectionDto): Promise<selectedPharmacy> {
    const { start, dest, pharmacyId } = query;
    try {
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

      const pharmacy = await this.prismaService.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },
      });
      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      return {
        ...pharmacy,
        coords,
        distance: respJson.features[0].properties.summary.distance,
      } as selectedPharmacy;
    } catch (error) {
      return error;
    }
  }
}
type selectedPharmacy = Pharmacy & {
  distance: number;
  coords: number[][];
};
