import { IsNotEmpty } from 'class-validator';

export class InfluencerDto {
  @IsNotEmpty()
  readonly influencer_id: string;
}
