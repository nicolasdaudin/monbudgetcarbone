import { IsNotEmpty, MinLength } from "class-validator";

export class GetAirportsDto {
  @IsNotEmpty()
  @MinLength(3)
  q: string;
}