import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { BlogsService } from '../blogs/blogs.service.js';
import { CommentsService } from '../comments/comments.service.js';
import { UsersService } from '../users/users.service.js';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post('blogs/:id/approve')
  approve(@Param('id') id: string) {
    return this.blogsService.approve(id);
  }

  @Get('blogs/pending')
  pending() {
    return this.blogsService.listPending();
  }

  @Post('blogs/:id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.blogsService.reject(id, body.reason);
  }

  @Get('users')
  users() {
    return this.usersService.listUsers();
  }

  @Patch('users/:id/status')
  setStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.usersService.setActive(id, !!body.isActive);
  }

  @Get('comments')
  comments() {
    return this.commentsService.listAll();
  }

  @Post('comments/:id/remove')
  removeComment(@Param('id') id: string) {
    return this.commentsService.moderateRemove(id);
  }
}
