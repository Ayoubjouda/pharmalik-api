import { Injectable } from '@nestjs/common';
// import { decode } from '@mapbox/polyline';
import { ConfigService } from '@nestjs/config';
import { DirectionDto } from './dto/pharmacy.dto';
@Injectable()
export class PharmacyService {
  constructor(private configService: ConfigService) {}
  findAll() {
    return `This action returns all pharmacy`;
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
