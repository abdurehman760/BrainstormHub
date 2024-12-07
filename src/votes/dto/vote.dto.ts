import { IsInt, IsIn } from 'class-validator';

export class VoteDto {
  @IsInt()
  @IsIn([1, -1], { message: 'Vote value must be either 1 (upvote) or -1 (downvote).' })
  value: number;
}
