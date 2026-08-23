import { IsIn } from 'class-validator';

export class UpdateKycDto {
  @IsIn(['VERIFIED', 'REJECTED'])
  status: 'VERIFIED' | 'REJECTED';
}
