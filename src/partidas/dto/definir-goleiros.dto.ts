import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoleiroTimeDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  timeIndex: number;

  @IsMongoId()
  @IsNotEmpty()
  goleiroId: string;
}

export class DefinirGoleirosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoleiroTimeDto)
  @IsNotEmpty()
  goleiros: GoleiroTimeDto[];
}
