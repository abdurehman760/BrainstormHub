import { Controller, Post, Param, Body, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the JwtAuthGuard
import { VoteDto } from './dto/vote.dto'; // Import the VoteDto

@UseGuards(JwtAuthGuard) // Protect the routes with JwtAuthGuard
@Controller('ideas/:id/vote') // Define route for voting on an idea
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post() // Endpoint to vote on an idea
  @UsePipes(new ValidationPipe({ transform: true })) // Validate the incoming request body
  async vote(@Param('id') ideaId: string, @Body() voteDto: VoteDto, @Request() req) {
    const supabaseId = req.user.sub; // Extract Supabase UID from the JWT token
    return this.votesService.voteOnIdea(ideaId, voteDto.value, supabaseId); // Call service to process the vote
  }
}
