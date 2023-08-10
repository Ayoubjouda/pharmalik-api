import { Controller, Get, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { DirectionDto } from './dto/pharmacy.dto';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('direction')
  findDirection(@Query() query: DirectionDto) {
    return this.pharmacyService.findDirection(query);
  }
}
