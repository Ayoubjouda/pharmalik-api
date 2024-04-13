import { Controller, Get, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CoordinatesDto, DirectionDto } from './dto/pharmacy.dto';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  getPharmacy(@Query() query: CoordinatesDto) {
    return this.pharmacyService.findNerbyPharmacy(query);
  }

  @Get('all')
  getAllPharmacy() {
    return this.pharmacyService.getAllPharmacys();
  }

  @Get('direction')
  findDirection(@Query() query: DirectionDto) {
    return this.pharmacyService.findDirection(query);
  }
}
