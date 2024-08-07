import { IsNotEmpty, IsOptional } from 'class-validator';

export class DirectionDto {
  @IsNotEmpty()
  start: string;
  @IsNotEmpty()
  dest: string;
  @IsNotEmpty()
  pharmacyId: string;
}

export class CoordinatesDto {
  @IsNotEmpty()
  latitude: number;
  @IsNotEmpty()
  longitude: number;
  @IsNotEmpty()
  radius: number;
  @IsOptional()
  filter: string;
}
