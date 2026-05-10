import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { BlogsService } from './blogs.service.js';
import { CreateBlogDto, UpdateBlogDto } from './dto.js';

@UseGuards(AuthGuard('jwt'))
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBlogDto) {
    return this.blogsService.create({ id: user.id } as never, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.blogsService.listMine(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.blogsService.remove(user.id, id);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.blogsService.submit(user.id, id);
  }
}
